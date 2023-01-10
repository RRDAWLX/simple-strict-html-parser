export type Token = TextToken | SelfClosingTagToken | OpeningTagToken | ClosingTagToken
type TextToken = {
  type: 1;
  text: string;
}
type OpeningTagToken = {
  type: 2;
  tagName: string;
  attributes: Record<string, string>;
}
type ClosingTagToken = {
  type: 3;
  tagName: string;
}
type SelfClosingTagToken = {
  type: 4;
  tagName: string;
  attributes: Record<string, string>;
}

type Data = {
  html: string;
  len: number;
  i: number;
  tokens: Token[];
}

export const TokenTypes = {
  text: 1,
  openingTag: 2,
  closingTag: 3,
  selfClosingTag: 4,
}

export function tokenize(html: string): Token[] {
  const len = html.length
  const data: Data = {
    html,
    len,
    i: 0, // 当前要解析的字符位置
    tokens: [],
  }

  while (data.i < len) {
    if (html[data.i] === LeftAngleBracket) {
      data.i++
      parseTag(data)
    } else {
      parseText(data)
    }
  }

  return data.tokens
}

const LeftAngleBracket = '<'
const RightAngleBracket = '>'
const Slash = '/'
const RegExps = {
  whitespace: /\s/,
  tagNameStartCharacter: /[a-z]/,
  tagNameCharacter: /[a-z0-9-]/,
}

function parseTag (data: Data): void {
  if (skipWhitespace(data)) {
    throw new Error('标签的 "<" 后不能跟空白符')
  }

  if (data.i >= data.len) {
    throw new Error('标签不完整')
  }

  if (data.html[data.i] === Slash) {
    data.i++
    parseClosingTag(data)
  } else {
    parseStartTag(data)
  }
}

function parseStartTag(data: Data): void {
  // 一定还有未被解析的字符，且首字符肯定不是空白符
  const tagName = parseTagName(data)
  const attributes = parseAttributes(data)

  let { html, len, i, tokens } = data

  if (i >= len) {
    throw new Error('标签不完整')
  }

  // 解析完 attributes 后，如果还有字符，必然是 "/" 或 ">"

  let isSelfClosing = false

  if (html[i] === Slash) {
    i++
    isSelfClosing = true
  }

  if (i >= len) {
    throw new Error('标签不完整')
  }

  if (html[i] === RightAngleBracket) {
    data.i = i + 1
    tokens.push({
      type: isSelfClosing ? TokenTypes.selfClosingTag : TokenTypes.openingTag,
      tagName,
      attributes,
    } as SelfClosingTagToken | OpeningTagToken)
  } else {
    throw new Error('开始标签格式有误')
  }
}

function parseClosingTag(data: Data): void {
  // 有可能字符串已经被解析完
  if (data.i >= data.len) {
    throw new Error('标签不完整')
  }

  if (skipWhitespace(data)) {
    throw new Error('结束标签 "</" 后不能有空白符')
  }

  const tagName = parseTagName(data)

  if (skipWhitespace(data)) {
    throw new Error('结束标签的标签名和 ">" 之间不能有空白符')
  }

  let { html, len, i, tokens } = data

  if (i >= len) {
    throw new Error('结束标签缺少 ">"') 
  }

  if (html[i] !== RightAngleBracket) {
    throw new Error('结束标签格式有误')
  }

  data.i = i + 1
  tokens.push({
    type: TokenTypes.closingTag,
    tagName,
  } as ClosingTagToken)
}

/**
 * 解析标签名，未解析到标签名或标签名格式有误会报错。 
 * @returns 标签名
 */
function parseTagName(data: Data): string {
  // 一定还有未被解析的字符
  let { html, len, i } = data

  if (!RegExps.tagNameStartCharacter.test(html[i])) {
    throw new Error('标签名首字符不符合规范')
  }

  const start = i++

  while (i < len) {
    const char = html[i]

    if (isWhitespace(char) || isTagEndCharacter(char)) {
      break
    }

    if (RegExps.tagNameCharacter.test(html[i])) {
      i++
    } else {
      throw new Error('标签名不符合规范')
    }
  }

  data.i = i
  return html.slice(start, i)
}

function parseAttributes(data: Data): Record<string, string> {
  // 有可能字符串已经被解析完
  const attributes = {}

  while (data.i < data.len) {
    if (isTagEndCharacter(data.html[data.i])) {
      break
    }

    parseAttribute(data, attributes)
  }

  return attributes
}

function parseAttribute(data: Data, attributes: Record<string, string>) {
  // 一定还有未被解析的字符，且不是 "/"、">"
  if (skipWhitespace(data) === 0) {
    throw new Error('HTML 属性名前缺少空白符')
  }

  if (data.i >= data.len || isTagEndCharacter(data.html[data.i])) {
    return
  }

  const name = parseAttributeName(data)
  const value = parseAttributeValue(data)
  attributes[name] = value
}

function parseAttributeName(data: Data): string {
  // 一定还有未被解析的字符，切第一个字符不是空白符、"/"、">"
  let { html, len, i } = data

  if (!RegExps.tagNameStartCharacter.test(html[i])) {
    throw new Error('属性名首字符不规范')
  }

  let start = i++
  
  while (i < len) {
    let char = html[i]

    if (RegExps.tagNameCharacter.test(char)) {
      i++
      continue
    }
    
    if (
      char === '=' ||
      isWhitespace(char) ||
      isTagEndCharacter(char)
    ) {
      break
    }

    throw new Error('属性名字符不规范')
  }

  data.i = i
  return html.slice(start, i)
}

function parseAttributeValue(data: Data): string {
  // 有可能字符串已经被解析完
  let { html, len, i } = data

  if (i >= len || html[i++] !== '=') {
    return ''
  }

  if (i >= len) {
    throw new Error('标签不完整')
  }

  if (
    isWhitespace(html[i]) ||
    isTagEndCharacter(html[i])
  ) {
    throw new Error('缺少属性值')
  }

  if (html[i++] !== '"') {
    throw new Error('属性值不规范')
  }

  let start = i

  while (i < len && html[i] !== '"') {
    i++
  }

  if (i >= len) {
    throw new Error('标签不完整')
  }

  data.i = i + 1
  return html.slice(start, i)
}

function parseText(data: Data): void {
  // 一定还有未解析的字符
  let { html, len, i, tokens } = data
  let start = i++

  while (i < len && html[i] !== LeftAngleBracket) {
    i++
  }

  tokens.push({
    type: TokenTypes.text,
    text: html.slice(start, i),
  } as TextToken)
  data.i = i
}

/**
 * 跳过空白字符，并返回跳过的空白字符的数量。
 * @returns {number} 跳过的空白字符的数量
 */
function skipWhitespace(data: Data): number {
  let amount = 0;
  let { html, len, i } = data

  while (i < len && isWhitespace(html[i])) {
    amount++
    i++
  }

  data.i = i
  return amount
}

function isWhitespace(char: string): boolean {
  return RegExps.whitespace.test(char)
}

/**
 * 判断字符是否为 "/" 或 ">"。
 */
function isTagEndCharacter(char: string): boolean {
  return char === Slash || char === RightAngleBracket
}
