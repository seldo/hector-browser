/* v4
Handles:
- arbitrary tags
- tag attributes with spaces in quotes
- whitespace
- arbitrary levels of nesting
- self-closing tags
*/

const util = require('util')
const Canvas = require('canvas')
const cpng = require('console-png')
const fs = require('fs')
const exec = require('child_process').execSync;

let code = `<html>
  <head>
    <title>Test page</title>
    <script href="this tag is empty"></script>
  </head>
  <body>
    <div class="fun" style="stuff">
      Text can be here
      <img src="file.jpg" />
      <p>And also here</p>
      <p>And here too</p>
      And additionally here
    </div>
    <br/>
    <arbitrary bare>arbitrary tags work</arbitrary>
    <also foo="bar" bee="baz">
      <img src="file2.jpg"/>
      <br/>
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

function parseAttributes(str) {
  // first get the tag name, which is everything up to the first space
  let tagName
  let firstSpace = str.indexOf(' ')
  if ( firstSpace > 0) {
    tagName = str.substr(0,firstSpace)
  } else {
    // if there is no space, then it's just the whole string and there are no attributes
    tagName = str
    return [tagName,[]]
  }
  // there are some attributes, so remove the tag name and keep going
  str = str.substr(firstSpace + 1)
  // attributes are strings followed by an equals sign with a value enclosed by quotes
  // attributes are separated by spaces
  // TODO: attributes without quotes, bare attributes (i.e. no value)
  let pattern = RegExp(' *?(.*?)=("(.*?)")','g') 
  let tagAttributes = []
  // RegExp.exec is super annoying
  while(attribute = pattern.exec(str)) {
    tagAttributes.push({
      attributeName: attribute[1].trim(),
      attributeValue: attribute[3]
    })
  }  
  return [tagName,tagAttributes]
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
      // are we self-closing?
      let selfClosing = (tagValue.indexOf('/') === tagValue.length - 1)
      if(selfClosing) {
        tagValue = tagValue.substr(0,tagValue.length - 1)
        node.subtype = 'self-closing'
      }
      // do we have attributes?
      let [tagName, tagAttributes] = parseAttributes(tagValue)
      node.name = tagName
      if (tagAttributes.length > 0) node.attributes = tagAttributes
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
        if (element.subtype == 'opening' || element.subtype == 'self-closing') {
          let node = {
            tagName: element.name
          }
          if(element.attributes) {
            node.attributes = element.attributes
          }
          if (element.subtype == 'opening') {
            // opening tags have children
            node.children = buildTree(arr)
          }
          // both types add themselves to the tree and continue
          tree.push(node)
        // closing tags simply return the tree
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

function render(tree) {
  //reallyLog(tree)

  let canvas = new Canvas(200, 200)
  let ctx = canvas.getContext('2d');
 
  ctx.font = '30px Impact';
  ctx.rotate(.1);
  ctx.fillText("Hi Hector!!!!", 50, 100);
  
  var te = ctx.measureText('Awesome!');
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + te.width, 102);
  ctx.stroke();
  
  console.log(exec("./imgcat.sh",{input:canvas.toBuffer()}).toString())

}

//reallyLog(buildTree(parse(code)))
render(buildTree(parse(code)))

function reallyLog(thing) {
  console.log(util.inspect(thing,{showHidden: false, depth: null}))
}
