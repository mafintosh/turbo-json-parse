const compile = require('./')

// pass in a type schema
const parse = compile({
  hello: 'string',
  num: 'number',
  flag: 'boolean',
  flags: ['boolean'], // array of booleans
  nested: {
    more: 'string'
  }
})

const ex = JSON.stringify({
  hello: 'world'
})

// will return {hello: 'world'}
console.log(parse(ex))

