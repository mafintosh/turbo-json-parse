const compile = require('./')

// pass in a type schema
const parse = compile.from({
  hello: 'string',
  num: 42,
  testing: null,
  flag: true,
  flags: [true],
  nested: {
    more: 'string'
  }
})

const ex = JSON.stringify({
  hello: 'world',
  testing: null
})

// will return {hello: 'world'}
console.log(parse(ex))
