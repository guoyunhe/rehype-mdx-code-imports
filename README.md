# rehype-mdx-code-imports

An MDX rehype plugin for extracting imports from code into JSX props. Useful for rendering [React Live](https://github.com/FormidableLabs/react-live) demo.

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
/*@jsxRuntime automatic*/
/*@jsxImportSource react*/
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

This plugin must be used with [rehype-mdx-code-props](https://github.com/remcohaszing/rehype-mdx-code-props) and loaded before it.

Here is an example to use it with Vite:

```ts
// vite.config.ts
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react-swc';
import recmaExportFilepath from 'recma-export-filepath';
import recmaMdxDisplayname from 'recma-mdx-displayname';
import rehypeMdxCodeImports from 'rehype-mdx-code-imports';
import rehypeMdxCodeProps from 'rehype-mdx-code-props';
import rehypeMdxTitle from 'rehype-mdx-title';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkMdxImages from 'remark-mdx-images';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        recmaPlugins: [recmaExportFilepath, recmaMdxDisplayname],
        rehypePlugins: [
          rehypeMdxTitle,
          rehypeMdxCodeImports, // 👈 here it is, must before rehypeMdxCodeProps
          rehypeMdxCodeProps,
        ],
        remarkPlugins: [
          remarkGfm,
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkMdxImages,
        ],
      }),
    },
    react({ tsDecorators: true }),
  ],
});
```

```tsx
// docs/app.tsx
import README from './README.md';

const importRegex = /import[\w_,{}$\s]+from\s['"]([.@\w/_-]+)['"];?/gm;

export default function App() {
  return (
    <README
      components={{
        pre: ({ children, imports = {}, ...props }: any) => {
          const codeElem = Children.only(children);
          const language = codeElem.props.className?.substring(9) || 'bash';
          const code = codeElem.props.children?.trim?.();
          return ['jsx', 'tsx'].includes(language) ? (
            <LiveProvider
              code={code}
              enableTypeScript={language === 'tsx'}
              // 👇 strip all import statements because react-live doesn't support them...
              transformCode={(code) => code.replace(importRegex, '')}
              scope={imports}
            >
              <LivePreview />
              <LiveError />
              <LiveEditor />
            </LiveProvider>
          ) : (
            <pre {...props}></pre>
          );
        },
      }}
    />
  );
}
```

## Options

### `tagName: 'pre' | 'code`

Default: `'pre'`

Markdown code block will be converted to a `code` wrapped by a `pre`. You can choose which one to
attach `imports={{ ... }}` property.

By default, it is added to `pre`:

```jsx
<pre imports={{ ... }}>
  <code className="language-jsx">...</code>
</pre>
```

If you want to attach to `code`:

```jsx
<pre>
  <code className="language-jsx" imports={{ ... }}>...</code>
</pre>
```

### `languages: string[]`

Default: `['jsx', 'tsx']`

What languages to parse imports. Since this plugin is mostly used with [React Live](https://github.com/FormidableLabs/react-live), the default language support is `jsx` and `tsx`. In theory you can enable `js` and `ts` if needed, but is it not tested.
