import { describe, expect, test } from '@jest/globals'
import { tokenize, TokenTypes } from './tokenizer'

describe('tokenizer', () => {
  describe('正常情况', () => {
    test('解析文本', () => {
      const text = 'html 文本'
      expect(tokenize(text))
        .toEqual([{
          type: TokenTypes.text,
          text,
        }])
    })

    test('解析开始标签', () => {
      expect(tokenize('<div>'))
        .toEqual([{
          type: TokenTypes.openingTag,
          tagName: 'div',
          attributes: {},
        }])

      expect(tokenize('<div   >'))
        .toEqual([{
          type: TokenTypes.openingTag,
          tagName: 'div',
          attributes: {},
        }])

      expect(tokenize('<div id="main">'))
        .toEqual([{
          type: TokenTypes.openingTag,
          tagName: 'div',
          attributes: {
            id: 'main',
          },
        }])

      expect(tokenize('<div id="main"   >'))
        .toEqual([{
          type: TokenTypes.openingTag,
          tagName: 'div',
          attributes: {
            id: 'main',
          },
        }])
    })

    test('解析结束标签', () => {
      expect(tokenize('</div>'))
        .toEqual([{
          type: TokenTypes.closingTag,
          tagName: 'div',
        }])
    })

    test('解析自闭和标签', () => {
      expect(tokenize('<img src="http://www.image.com/test.jpg" />'))
        .toEqual([{
          type: TokenTypes.selfClosingTag,
          tagName: 'img',
          attributes: {
            src: 'http://www.image.com/test.jpg',
          },
        }])
    })

    test('综合内容', () => {
      expect(tokenize('<div id="main"><img src="http://www.image.com/test.jpg" /> html 文本 </div>'))
        .toEqual([
          {
            type: TokenTypes.openingTag,
            tagName: 'div',
            attributes: {
              id: 'main',
            },
          },
          {
            type: TokenTypes.selfClosingTag,
            tagName: 'img',
            attributes: {
              src: 'http://www.image.com/test.jpg',
            },
          },
          {
            type: TokenTypes.text,
            text: ' html 文本 ',
          },
          {
            type: TokenTypes.closingTag,
            tagName: 'div',
          },
        ])
    })
  })

  describe('异常情况', () => {
    describe('标签格式有误', () => {
      test('< div>', () => {
        expect(() => tokenize('< div>')).toThrow()
      })

      test('< /div>', () => {
        expect(() => tokenize('< /div>')).toThrow()
      })
      
      test('</ div>', () => {
        expect(() => tokenize('</ div>')).toThrow()
      })

      test('</div >', () => {
        expect(() => tokenize('</div >')).toThrow()
      })

      test('<img / >', () => {
        expect(() => tokenize('<img / >')).toThrow()
      })
    })
  })

  describe('标签不完整', () => {
    test('<', () => {
      expect(() => tokenize('<')).toThrow()
    })

    test('<div', () => {
      expect(() => tokenize('<div')).toThrow()
    })

    test('<div id=', () => {
      expect(() => tokenize('<div id=')).toThrow()
    })
    
    test('</', () => {
      expect(() => tokenize('</')).toThrow()
    })

    test('</div', () => {
      expect(() => tokenize('</div')).toThrow()
    })

    test('</div/>', () => {
      expect(() => tokenize('</div/>')).toThrow()
    })

    test('<img /', () => {
      expect(() => tokenize('<img /')).toThrow()
    })

    test('<img /<img />', () => {
      expect(() => tokenize('<img /<img />')).toThrow()
    })
  })

  describe('标签名不规范', () => {
    test('<DIV>', () => {
      expect(() => tokenize('<DIV>')).toThrow()
    })

    test('<0d>', () => {
      expect(() => tokenize('<0d>')).toThrow()
    })

    test('<d$>', () => {
      expect(() => tokenize('<d$>')).toThrow()
    })
  })

  describe('属性名不规范', () => {
    test('<div ID>', () => {
      expect(() => tokenize('<div ID>')).toThrow()
    })

    test('<div 0id>', () => {
      expect(() => tokenize('<div 0id>')).toThrow()
    })

    test('<div id$>', () => {
      expect(() => tokenize('<div id$>')).toThrow()
    })
  })

  describe('属性不完整', () => {
    test('<div id=>', () => {
      expect(() => tokenize('<div id=>')).toThrow()
    })

    test('<div id=">', () => {
      expect(() => tokenize('<div id=">')).toThrow()
    })

    test('<div id="main>', () => {
      expect(() => tokenize('<div id="main>')).toThrow()
    })
  })

  describe('属性格式不规范', () => {
    test('<div id="main"class="c">', () => {
      expect(() => tokenize('<div id="main"class="c">')).toThrow()
    })

    test('<div id ="main">', () => {
      expect(() => tokenize('<div id ="main">')).toThrow()
    })

    test('<div id= "main">', () => {
      expect(() => tokenize('<div id= "main">')).toThrow()
    })

    test('<div id = "main">', () => {
      expect(() => tokenize('<div id = "main">')).toThrow()
    })

    test('<div id=main>', () => {
      expect(() => tokenize('<div id=main>')).toThrow()
    })
  })
})