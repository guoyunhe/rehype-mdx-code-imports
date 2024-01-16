import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import { type Program } from 'estree-jsx';
import type { Root, Text } from 'hast';
import { type Plugin } from 'unified';
import { visitParents } from 'unist-util-visit-parents';

const importRegex = /import[\w_,{}$\s]+from\s['"]([.@\w/_-]+)['"];?/gm;

/**
 * @internal
 */
declare module 'hast' {
  interface ElementData {
    /**
     * Code meta defined by the mdast.
     */
    meta?: string;
  }
}

const parser = Parser.extend(jsx());

function getImportedNamesFromProgram(
  program: Program,
  removeList?: string[],
): string[] {
  const names = new Set<string>();
  program.body.forEach((declaration) => {
    if (declaration.type === 'ImportDeclaration') {
      declaration.specifiers = declaration.specifiers.filter((specifier) => {
        if (specifier.local.name) {
          names.add(specifier.local.name);
        }
        return !removeList?.includes(specifier.local.name);
      });
    }
  });
  return Array.from(names);
}

function getImportedNamesFromRoot(root: Root): string[] {
  let names: string[] = [];
  root.children.forEach((child) => {
    if (child.type === 'mdxjsEsm' && child.data?.estree) {
      names = [...names, ...getImportedNamesFromProgram(child.data?.estree)];
    }
  });
  return Array.from(new Set(names));
}

export interface RehypeMdxCodeImportsOptions {
  /**
   * The tag name to add the attributes to.
   *
   * @default 'pre'
   */
  tagName?: 'code' | 'pre';
}

/**
 * An MDX rehype plugin for extracting imports from code into JSX props. Useful for rendering React Live demo.
 */
const rehypeMdxCodeImports: Plugin<[RehypeMdxCodeImportsOptions?], Root> = ({
  tagName = 'pre',
} = {}) => {
  if (tagName !== 'code' && tagName !== 'pre') {
    throw new Error(`Expected tagName to be 'code' or 'pre', got: ${tagName}`);
  }

  return (ast) => {
    visitParents(ast, 'element', (node, ancestors) => {
      if (node.tagName !== 'code') {
        return;
      }

      const parent = ancestors.at(-1)!;

      if (tagName === 'pre') {
        if (parent.type !== 'element') {
          return;
        }

        if (parent.tagName !== 'pre') {
          return;
        }

        if (parent.children.length !== 1) {
          return;
        }
      }

      if (node.data?.meta?.includes(' imports={{')) {
        return;
      }

      const className =
        node.properties?.className && Array.isArray(node.properties.className)
          ? node.properties?.className.find(
              (cls) => typeof cls === 'string' && cls.startsWith('language-'),
            )
          : node.properties?.className;

      // only process jsx and tsx code blocks
      if (className === 'language-jsx' || className === 'language-tsx') {
        const sourceCode = (
          node.children?.find((item) => item.type === 'text') as Text
        )?.value;
        // ensure source code is not empty
        if (sourceCode?.trim()) {
          const matches = sourceCode.matchAll(importRegex);
          if (matches) {
            const importsStr = Array.from(matches)
              .map((item) => item[0])
              .join('\n');
            const importsAst = parser.parse(importsStr, {
              ecmaVersion: 'latest',
              sourceType: 'module',
            });

            const existingMembers = getImportedNamesFromRoot(ast);
            const importsMembers = getImportedNamesFromProgram(
              importsAst as Program,
              existingMembers,
            );

            // append imports meta props to the code (depends on rehype-mdx-code-props)
            if (!node.data) {
              node.data = {};
            }
            if (!node.data.meta) {
              node.data.meta = '';
            }
            node.data.meta += ` imports={{ ${importsMembers.sort().join(', ')} }}`;

            // insert import statements to MDX root
            ast.children.unshift({
              type: 'mdxjsEsm',
              value: '',
              data: {
                estree: importsAst as any,
              },
            });
          }
        }
      }
    });
  };
};

export default rehypeMdxCodeImports;
