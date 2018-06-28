/**
  * helper functions:
  */
import util from 'util'

const removeReturns = str => str.replace(/[\n\r]/g, '')
const removeSpaces = str => str.replace(/\s+/g, '')

export const flattenDeepArr = arr =>
  arr.reduce((acc, val) => Array.isArray(val)
    ? acc.concat(flattenDeepArr(val))
    : acc.concat(val), [])

export const formatString = str => {
  str = removeReturns(str)
  str = removeSpaces(str)
  return str
}

export const isEmptyString = str => str.length

export const logObj = obj => console.log(util.inspect(obj, { showHidden: false, depth: null }))

export const parseOpenBracket = str => str.split('<')
