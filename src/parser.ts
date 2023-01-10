import { Token, tokenize, TokenTypes } from './tokenizer'

// dom node type https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
export const NodeTypes = {
  element: 1,
  text: 3,
} as const

export type Node = ElementNode | TextNode
type ElementNode = {
  nodeType: (typeof NodeTypes)['element'];
  tagName: string;
  attributes: Record<string, string>;
  children: Node[];
}
type TextNode = {
  nodeType: (typeof NodeTypes)['text'];
  text: string;
}

export function parse (html: string): Node[] {
  return generateAST(tokenize(html))
}

export function generateAST (tokens: Token[]): Node[] {
  const root: ElementNode = {
    nodeType: NodeTypes.element,
    tagName: '',
    attributes: {},
    children: [],
  }
  let cur = root
  const stack: ElementNode[] = []
  
  for (const token of tokens) {
    if (token.type === TokenTypes.text) {
      cur.children.push({
        nodeType: NodeTypes.text,
        text: token.text,
      })
    } else if (token.type === TokenTypes.closingTag) {
      if (cur.tagName !== token.tagName) {
        throw new Error(`</${token.tagName}> 无匹配的开始标签`)
      }

      cur = stack.pop() as ElementNode
    } else {
      const node = {
        nodeType: NodeTypes.element,
        tagName: token.tagName,
        attributes: token.attributes,
        children: [],
      }
      cur.children.push(node)

      if (token.type === TokenTypes.openingTag) {
        stack.push(cur)
        cur = node
      }
    }
  }

  if (cur !== root) {
    throw new Error(`部分开始标签无匹配的结束标签`)
  }

  return root.children
}