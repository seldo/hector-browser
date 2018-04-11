/* v1
Handles:
- arbitrary tags
- whitespace
- arbitrary levels of nesting
*/

const util = require('util')

let code = `<a>
  <b>
    text can be here
    <c>hello thing</c><d>what thing2</d>
    <a>super wow</a>
    what about text out here
  </b>
  <d>yay</d>
  <bob>fun times</bob>
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
    // splitting on close brackets gives us arrays of tags and the text until the next node
    let splitOnCloseBrackets = splitOnCloseBracket(splitOnOpenBrackets[i])
    // so the first value of closebrackets is always a tag, just what kind?
    let tagValue = splitOnCloseBrackets.shift()
    if (!tagValue) continue // ignore empty tag names
    let node = {
      type: 'tag'
    }
    if (tagValue.indexOf('/') === 0) {
      node.subtype = 'closing'
      node.name = tagValue.substring(1)
    } else {
      node.subtype = 'opening'
      node.name = tagValue
    }
    splitOnBoth.push(node)
    // now process all the remaining text elements
    for( let j = 0; j < splitOnCloseBrackets.length; j++) {
      let value = splitOnCloseBrackets[j]
      // ignore whitespace, breakline and other "empty" nodes
      if (value.trim()) {
        splitOnBoth.push({
          value:value,
          type:'text'
        })
      }
    }
  }
  return splitOnBoth
}

function buildTree(arr) {
  let tree = null
  let nodes = 0
  do {
    let element = arr.shift()
    switch (element.type) {
      case 'tag':
        // opening tags create a key with that tag name and recurse
        if (element.subtype == 'opening') {
          if (!tree) tree = {}
          tree[element.name] = buildTree(arr)
        // closing tags return the tree
        } else if (element.subtype == 'closing') {
          return tree
        }
        break
      default:
        // it's text
        if (!tree) tree = {}
        tree['node_' + nodes] = { text: element.value }
        nodes++
        break
    }
  } while(arr.length > 0)
  return tree
}

reallyLog(buildTree(parse(code)))
//reallyLog(parse(code))

function reallyLog(thing) {
  console.log(util.inspect(thing,{showHidden: false, depth: null}))
}
