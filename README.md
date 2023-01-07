# simple-strict-html-parser

简单的严格 HTML 字符串解析器。  
“简单”是指只解析 HTML 标签和文本内容，语法不严格遵照 [HTML 语法](https://html.spec.whatwg.org/multipage/syntax.html#syntax)。  
“严格”是指 HTML 标签名必须小写，标签必须正确闭合，HTML 属性值必须用双引号包裹。

## EBNF 语法简介

```
生成式 = 生成式名 '=' [ 表达式 ] [';'] ;
表达式 = 选择项 { '|' 选择项 } ;
选择项 = 条目 { 条目 } ;
条目   = 生成式名 | 标记 [ '…' 标记 ] | 分组 | 可选项 | 重复项 ;
分组   = '(' 表达式 ')' ;
可选项 = '[' 表达式 ']' ;
重复项 = '{' 表达式 '}' ;

|   选择
()  分组
[]  可选（0 或 1 次）
{}  重复（0 到 n 次）
```

## 语法

非严格地基于 EBNF 描述 HTML 语法。  
"非严格"是指没有严格按照 EBNF 语法进行描述，比如会用到正则表达式描述语法。 

```
HTML = OpeningTag Text ClosingTag | SelfClosingTag | Text
StartTag = OpeningTag | SelfClosingTag

OpeningTag = "<" TagName {Attibute} {Whitespace} ">"
ClosingTag = "<" "/" TagName ">"
SelfClosingTag = "<" TagName {Attibute} {Whitespace} "/" ">"
Text = /[^<]*/

TagName = TagNameStartCharacter {TagNameCharacter}
TagNameStartCharacter = /[a-z]/
TagNameCharacter = /[a-z0-9-]/

Attibute = Whitespace {Whitespace} AttributeName ["=" AttributeValue]
AttributeName = TagName
AttributeValue = '"' /[^"]*/ '"'

Whitespace = /\s/
```