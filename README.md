# rehype-mdx-code-imports

An MDX rehype plugin for extracting imports from code into JSX props. Useful for rendering React Live demo.

This plugin is mostly inspired by [rehype-mdx-code-props](https://github.com/remcohaszing/rehype-mdx-code-props).
And it is recommended to these two plugin together to achieve better result.

## What it does

Convert the following code block (support `jsx` and `tsx`):

````markdown
```jsx
import Foobar from '@foo/bar';
import { Button } from 'antd';

render(<Button>Click me!</Button>);
```
````

into the following MDX component:

```jsx
/*@jsxRuntime automatic @jsxImportSource react*/
import Foobar from '@foo/bar';
import { Button } from 'antd';
function _createMdxContent(props) {
  const _components = {
    code: 'code',
    pre: 'pre',
    ...props.components,
  };
  return (
    <>
      {
        <_components.pre
          imports={{
            Button,
            Foobar,
          }}
        >
          <_components.code className="language-jsx">
            {
              "import Foobar from '@foo/bar';\nimport { Button } from 'antd';\n\nrender(<Button>Click me!</Button>);\n"
            }
          </_components.code>
        </_components.pre>
      }
    </>
  );
}
export default function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? (
    <MDXLayout {...props}>
      <_createMdxContent {...props} />
    </MDXLayout>
  ) : (
    _createMdxContent(props)
  );
}
```

## How to use it

```jsx
import README from './README.md';

<README components={{pre: }}/>

```
