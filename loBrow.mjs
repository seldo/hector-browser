import html from './data.mjs'
import {
  formatString,
  getAttributes,
  isEmptyString,
  logObj,
  parseOpenBracket,
  removeSpaces
} from './helperFunctions.mjs'

const getElements = str => {
  // remove returns and spaces
  str = formatString(str)

  // split string on open brackets
  let htmlArr = parseOpenBracket(str)

  // remove empty array elements
  htmlArr = htmlArr.filter(isEmptyString)

  console.log('htmlArr')
  console.log(htmlArr)
  
  
  // build arr of obj's; keys = els, values = types
  let tree = []
  htmlArr = htmlArr.map((el) => {
    if (el.substring(0, 1) === '/') {
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
      el[1] = removeSpaces(el[1])
      tree.push({
        el: el[0],
        type: 'opening',
        content: el[1] === '' ? null : el[1]
      })
    }
  })
  return tree
}

/**
  * build DOM tree from `getElements` return value
  */
const buildTree = arr => {
  let parsedHtml = []

  while (arr.length) {
    let element = arr.shift()

    switch (element.type) {
      case 'opening':
        parsedHtml.push({
          name: element.el.split(' ')[0],
          content: element.content,
          attributes: getAttributes(element.el),
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
