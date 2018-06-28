import html from './data.mjs'
import {
  formatString,
  isEmptyString,
  logObj,
  parseOpenBracket
} from './helperFunctions.mjs'

/**
 * lv 0: predetermined tags
 */

const getElements = str => {
  str = formatString(str)
  str = parseOpenBracket(str)
  str = str.filter(isEmptyString)
  let tree = []

  str = str.map((el) => {
    if (el.substr(0, 1) === '/') {
      el = el.slice(1, -1)
      tree.push({
        el,
        type: 'closing'
      })
    } else if (el[el.length - 1] === '>') {
      el = el.slice(0, -1)
      tree.push({
        el,
        type: 'opening'
      })
    } else {
      el = el.split('>')
      tree.push({
        el: el[0],
        type: 'opening'
      })
      tree.push({
        el: el[1],
        type: 'content'
      })
    }
  })
  return tree
}

/**
  * build DOM tree
  */
const buildTree = arr => {
  let parsedHtml = []

  while (arr.length) {
    let element = arr.shift()

    switch (element.type) {
      case 'opening':
        parsedHtml.push({
          name: element.el,
          children: buildTree(arr)
        })
        break
      case 'content':
        parsedHtml.push({
          value: element.el
        })
        break
      case 'closing':
        return parsedHtml
    }
  }

  return parsedHtml
}

logObj(buildTree(getElements(html)))

/**
 * lv 1: arbitrary tags
 */
