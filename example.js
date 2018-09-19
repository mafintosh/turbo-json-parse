const compile = require('./')

// pass in a type schema
const parse = compile.from({
  hello: 'string',
  num: 42,
  null: null,
  flag: true,
  flags: [true],
  nested: {
    more: 'string'
  }
})

const ex = JSON.stringify({
  hello: 'world'
})

// will return {hello: 'world'}
console.log(parse(ex))
