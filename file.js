/**
 * lv 0: predetermined tags
 */

let util = require('util')

let html = '<html><body><div>hello</div><div><p>world.</p></div></body></html>'

const logObj = obj => console.log(util.inspect(obj, { showHidden: false, depth: null }))

const parseOpenBracket = str => str.split('<')

const parseCloseBracket = str => str.split('>')

const isEmptyString = str => str.length

const flattenDeepArr = arr =>
  arr.reduce((acc, val) => Array.isArray(val)
    ? acc.concat(flattenDeepArr(val))
    : acc.concat(val), [])

const parse = (str) => {
  let splitOnOpen = parseOpenBracket(str)
  let splitOnClose = splitOnOpen.map(parseCloseBracket)
  let splitOnBoth = flattenDeepArr(splitOnClose)
  splitOnBoth = splitOnBoth.filter(isEmptyString)

  return splitOnBoth
}

const buildTree = arr => {
  let parsedHtml = {}

  do {
    let element = arr.shift()

    switch (element) {
      case 'html':
      case 'body':
      case 'div':
      case 'p':
        parsedHtml[element] = buildTree(arr)
        break

      case '/html':
      case '/body':
      case '/div':
      case '/p':
        return parsedHtml

      default:
        parsedHtml = element
        return parsedHtml
    }
  } while (arr.length)
  return parsedHtml
}

logObj(buildTree(parse(html)))

/**
 * lv 1: arbitrary tags -- refactor parser
 */
