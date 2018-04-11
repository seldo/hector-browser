/* v2
Handles:
- arbitrary tags
- tag attributes
- whitespace
- arbitrary levels of nesting
*/

const util = require('util')

let code = `<html>
  <head>
    <title>Test page</title>
  </head>
  <body>
    <div class="fun" style="stuff">
      Text can be here
      <p>And also here</p>
      <p>And here too</p>
      And additionally here
    </div>
    <arbitrary>arbitrary tags work</arbitrary>
    <also foo="bar" bee="baz">
      Arbitrary attributes also work
    </also>
  </body>
</html>`

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
      // do we have attributes?
      let tagAttributes = tagValue.split(' ')
      // the first 'attribute' is the tag name itself
      node.name = tagAttributes.shift()
      // attributes are strings separated by an optional "="
      if(tagAttributes.length > 0) {
        node.attributes = tagAttributes.map((attString) => {
          let keyPair = attString.split('=')
          let attNode = {
            name: keyPair[0]
          }
          if (keyPair[1]) {
            // strip quotes
            attNode.value = keyPair[1].replace(/^"(.*)"$/, '$1');
          }
          return attNode
        })
      }
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
  let tree = []
  do {
    let element = arr.shift()
    switch (element.type) {
      case 'tag':
        // opening tags create a key with that tag name and recurse
        if (element.subtype == 'opening') {
          let node = {
            tagName: element.name
          }
          if(element.attributes) {
            node.attributes = element.attributes
          }
          node.children = buildTree(arr)
          tree.push(node)
        // closing tags return the tree
        } else if (element.subtype == 'closing') {
          return tree
        }
        break
      default:
        // it's text
        let node = {
          type: 'text',
          value: element.value
        }
        tree.push(node)
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
