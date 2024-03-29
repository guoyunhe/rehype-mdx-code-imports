/*@jsxRuntime automatic*/
/*@jsxImportSource react*/
import { Card as Card$$antd } from 'antd';
import Foobar$$foo_bar from '@foo/bar';
import { Button as Button$$antd } from 'antd';
function _createMdxContent(props) {
  const _components = {
    code: 'code',
    pre: 'pre',
    ...props.components,
  };
  return (
    <>
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
      {'\n'}
      <_components.pre>
        {
          <_components.code
            className="language-jsx"
            imports={{
              Button: Button$$antd,
              Card: Card$$antd,
            }}
          >
            {
              "import { Button, Card } from 'antd';\n\nrender(\n  <Card>\n    <Button>Click me!</Button>\n  </Card>,\n);\n"
            }
          </_components.code>
        }
      </_components.pre>
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
