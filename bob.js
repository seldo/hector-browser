const util = require('util')

let code = `<a>
  <b>
    <c>thing</c><d>thing2</d>
    <a>wow</a>
  </b>
  <d>yay</d>
</a>`

function splitOnOpenBracket(str) {
  return str.split('<')
}

function splitOnCloseBracket(str) {
  return str.split('>')
}

function parse(str) {
  let splitOnOpenBrackets = splitOnOpenBracket(str)
  let splitOnBoth = []
  for( let i = 0; i < splitOnOpenBrackets.length; i++) {
    let splitOnCloseBrackets = splitOnCloseBracket(splitOnOpenBrackets[i])
    splitOnBoth = splitOnBoth.concat(splitOnCloseBrackets)
  }
  return splitOnBoth
}

function buildTree(arr) {
  let tree = null
  let nodes = 0
  do {
    let element = arr.shift()
    switch (element) {
      case 'a':
      case 'b':
      case 'c':
      case 'd':
        // it's an opening tag
        if (!tree) tree = {}
        tree[element] = buildTree(arr)
        break
      case '/a':
      case '/b':
      case '/c':
      case '/d':
        // it's a closing tag
        return tree
        break
      default:
        // it's text
        if (!tree) tree = {}
        // non-empty text
        if(element.trim()) {
          tree['node_' + nodes] = { text: element }
          nodes++
        }
        // implicitly ignore empty nodes
    }
  } while(arr.length > 0)
  return tree
}

reallyLog(buildTree(parse(code)))

/*
let output = {
  a: {
    b: {
      c: {
        text: "thing"
      }
    }
  }
}
reallyLog(output)
*/

function reallyLog(thing) {
  console.log(util.inspect(thing,{showHidden: false, depth: null}))
}
