/* v4
Handles:
- arbitrary tags
- tag attributes with spaces in quotes
- whitespace
- arbitrary levels of nesting
- self-closing tags
- paint an arbitrary box model
*/

const util = require('util')
const Canvas = require('canvas')
const cpng = require('console-png')
const fs = require('fs')
const exec = require('child_process').execSync;

const browserWidth = 800
const browserHeight = 800

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

/**
 * Takes a box model and paint it.
 * A box model is a list of abstract things to paint.
 */
function paint(boxModel) {

  let canvas = new Canvas(browserWidth, browserHeight)
  let ctx = canvas.getContext('2d');

  function paintElement(ctx,model) {
    console.log("Painting " + model.name)
    switch(model.type) {
      case "rectangle":
        ctx.fillStyle = model.background
        ctx.fillRect(model.left,model.top,model.right-model.left,model.bottom-model.top)
        if(model.border != "none") {
          ctx.strokeStyle = model.border
          ctx.strokeRect(model.left,model.top,model.right-model.left,model.bottom-model.top)
        }
        break
      case "text":
        ctx.fillStyle = model.color
        ctx.textBaseline = 'top'
        ctx.font = model.size + 'px Times New Roman'
        ctx.fillText(model.value, model.left, model.top);
        break
      default:
        console.log("WTF is a " + model.type + "?")
    }
    if(model.children) {
      for(let i = 0; i < model.children.length; i++) {
        paintElement(ctx,model.children[i])
      }
    }
  }

  paintElement(ctx,boxModel)
 
  /*
  ctx.font = '30px Impact';
  ctx.rotate(.1);
  ctx.fillText("Hi Hector!!!!", 50, 100);
  
  var te = ctx.measureText('Awesome!');
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + te.width, 102);
  ctx.stroke();
  */
  
  console.log(exec("./imgcat.sh",{input:canvas.toBuffer()}).toString())

}

/**
 * This takes the theoretical tree and turns it into a box model
 * A box model is a bunch of instructions about what to paint
 */
function render(tree) {
  let boxModel = {
    name: "parentBox",
    type: "rectangle",
    border: "none",
    background: "rgba(100,100,100,1)",
    top: 0,
    left: 0,
    bottom: 400,
    right: 800,
    children: [
      {
        name: "childBox1",
        type: "rectangle",
        border: "rgba(255,0,0,1)",
        background: "rgba(255,255,255,1)",
        top: 0,
        left: 0,
        bottom: 100,
        right: 600,
        children: [
          {
            name: "textBox1",
            type: "text",
            font: "hahahaha not yet",
            color: "rgba(0,0,0,1)",
            size: "50",
            value: "Hello, world!",
            top: 5,
            left: 5,
            bottom: 55,
            right: "????"
          },
          {
            name: "textBox2",
            type: "text",
            font: "hahahaha not yet",
            color: "rgba(50,100,50,1)",
            size: "30",
            value: "This is some text!",
            top: 60,
            left: 5,
            bottom: 90,
            right: "????"
          }
        ] 
      }
    ]
  }

  paint(boxModel)
}

render(buildTree(parse(code)))

function reallyLog(thing) {
  console.log(util.inspect(thing,{showHidden: false, depth: null}))
}
