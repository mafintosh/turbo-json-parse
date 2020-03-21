const compile = require('./')

const dave = {
  checked: true,
  checker: false,
  dimensions: {
    height: 10,
    width: 5
  },
  id: 1,
  name: 'A green door',
  price: 12
}

const s = JSON.stringify(dave)
const b = Buffer.from(s)
const cnt = 1e7

for (let o = 0; o < 3; o++) {
  const veryFast = o > 0
  const safe = o < 2
  const opts = {
    ordered: veryFast,
    required: veryFast,
    unescapeStrings: !veryFast,
    fullMatch: safe,
    validate: safe
  }
  const parseNoBuf = compile(compile.inferRawSchema(dave, opts), opts)
  const parse = compile(
    compile.inferRawSchema(dave, opts),
    Object.assign({}, opts, { buffer: true })
  )

  if (o) console.log()
  console.log('Compiling with', opts)
  console.log('One parse', parseNoBuf(s))
  console.log('\nBenching from string\n')
  for (let r = 0; r < 2; r++) {
    console.log('Run ' + r)
    console.time('Benching turbo-json-parse from string')
    for (let i = 0; i < cnt; i++) {
      parseNoBuf(s)
    }
    console.timeEnd('Benching turbo-json-parse from string')
    console.time('Benching JSON.parse from string')
    for (let i = 0; i < cnt; i++) {
      JSON.parse(s)
    }
    console.timeEnd('Benching JSON.parse from string')
  }
  console.log('\nBenching from buffer\n')
  for (let r = 0; r < 2; r++) {
    console.log('Run ' + r)
    console.time('Benching turbo-json-parse from buffer')
    for (let i = 0; i < cnt; i++) {
      parse(b)
    }
    console.timeEnd('Benching turbo-json-parse from buffer')
    console.time('Benching JSON.parse from buffer')
    for (let i = 0; i < cnt; i++) {
      JSON.parse(b)
    }
    console.timeEnd('Benching JSON.parse from buffer')
  }
}
