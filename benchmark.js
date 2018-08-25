const compile = require('./')

const dave = {"checked":true,"checker":false,"dimensions":{"height":10,"width":5},"id":1,"name":"A green door","price":12}

const s = JSON.stringify(dave)
const b = Buffer.from(s)

const schema = compile.schema(dave)
const parse = compile(schema, {optional: false, validate: false, unsafe: false, buffer: true, unescapeStrings: false})

const parseNoBuf = compile(schema, {optional: false, validate: false, unsafe: false, unescapeStrings: false})


console.log('Generated code:')
console.log(parse.toString())
console.log('One parse:')
console.log(parse(s, b))

const cnt = 3e7

console.time('Benching turbo-json-parse with buffer')
for (var i = 0; i < cnt; i++) {
  parse(s, b)
}
console.timeEnd('Benching turbo-json-parse with buffer')

console.time('Benching turbo-json-parse without buffer')
for (var i = 0; i < cnt; i++) {
  parseNoBuf(s)
}
console.timeEnd('Benching turbo-json-parse without buffer')


console.time('Benching JSON.parse')
for (var i = 0; i < cnt; i++) {
  JSON.parse(s)
}
console.timeEnd('Benching JSON.parse')
