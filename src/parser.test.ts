import { describe, expect, test } from '@jest/globals'
import { parse, NodeTypes } from './parser'

describe('parse', () => {
  describe('正常情况', () => {
    test('解析文本', () => {
      expect(parse('html 文本'))
        .toEqual([{
          nodeType: NodeTypes.text,
          text: 'html 文本',
        }])
    })

    test('解析标签', () => {
      expect(parse('<div id="main"></div>'))
        .toEqual([{
          nodeType: NodeTypes.element,
          tagName: 'div',
          attributes: {
            id: 'main',
          },
          children: [],
        }])
    })

    test('解析自闭和标签', () => {
      expect(parse('<img src="./image.jpg" />'))
        .toEqual([{
          nodeType: NodeTypes.element,
          tagName: 'img',
          attributes: {
            src: './image.jpg',
          },
          children: [],
        }])
    })

    test('解析综合内容', () => {
      expect(parse('<div id="main">html 文本 <img src="./image.jpg" /></div>'))
        .toEqual([{
          nodeType: NodeTypes.element,
          tagName: 'div',
          attributes: {
            id: 'main',
          },
          children: [
            {
              nodeType: NodeTypes.text,
              text: 'html 文本 ',
            },
            {
              nodeType: NodeTypes.element,
              tagName: 'img',
              attributes: {
                src: './image.jpg',
              },
              children: [],
            },
          ],
        }])
    })
  })

  describe('异常情况', () => {
    const html1 = '<div>'
    test(html1, () => {
      expect(() => parse(html1)).toThrow()
    })

    const html2 = '</div>'
    test(html2, () => {
      expect(() => parse(html2)).toThrow()
    })
  })
})