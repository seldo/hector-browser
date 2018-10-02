/**
  * helper functions:
  */
import util from 'util'

export const removeReturns = str => str.replace(/[\n\r]/g, '')
export const removeSpaces = str => str.replace(/\s+/g, '')
export const removeSingleQuotes = str => str.replace(/\'+/g, '')

export const flattenDeepArr = arr =>
  arr.reduce((acc, val) => Array.isArray(val)
    ? acc.concat(flattenDeepArr(val))
    : acc.concat(val), [])

export const formatString = str => {
  str = removeReturns(str)
  // str = removeSpaces(str)
  return str
}

export const isEmptyString = str => str.length

export const logObj = obj => console.log(util.inspect(obj, { showHidden: false, depth: null }))

export const parseOpenBracket = str => str.split('<')

export const getAttributes = str => {
  let attributes = []
  let pos = str.indexOf('>')
  let subString = str.slice(0, pos)
  let spaceChar = subString.indexOf(' ')

  if (spaceChar !== -1) {
    subString = subString.split(' ')

    for (let element of subString) {
      let equalChar = element.indexOf('=')
      if (equalChar !== -1) {
        let attrs = element.split('=')
        attributes.push({
          type: attrs[0],
          value: removeSingleQuotes(attrs[1])
        })
      }
    }
  }
  return attributes
}