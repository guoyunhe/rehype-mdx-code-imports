/*@jsxRuntime automatic*/
/*@jsxImportSource react*/
import Foobar$$foo_bar from '@foo/bar';
import { Button as Button$$antd } from 'antd';
function _createMdxContent(props) {
  const _components = {
    code: 'code',
    pre: 'pre',
    ...props.components,
  };
  return (
    <_components.pre>
      {
        <_components.code
          className="language-jsx"
          imports={{
            Button: Button$$antd,
            Foobar: Foobar$$foo_bar,
          }}
        >
          {
            "import Foobar from '@foo/bar';\nimport { Button } from 'antd';\n\nrender(<Button>Click me!</Button>);\n"
          }
        </_components.code>
      }
    </_components.pre>
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
