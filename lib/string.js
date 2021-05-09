const genfun = require('generate-function')
const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const { name, validate, validateStrings } = ops(opts)
  const buffer = !!opts.buffer
  const unesc = opts.unescapeStrings !== false

  return compileString

  function compileString (gen, prop) {
    if (!gen.scope.parseString) {
      gen.scope.parseString = genparser(
        buffer,
        validate || validateStrings,
        unesc
      )
    }

    if (prop) {
      prop.set(`parseString(${name}, ptr)`)
      gen('ptr = parseString.pointer')
    } else {
      const str = gen.sym('str')
      gen(`
        const ${str} = parseString(${name}, ptr)
        parse.pointer = parseString.pointer
        return ${str}
      `)
    }
  }
}

function genparser (buffer, validate, unesc) {
  const {name, ch, indexOf, code, stringSlice} = ops({buffer})
  const gen = genfun()

  gen(`function parseString (${name}, ptr) {`)

  if (validate) {
    gen(
      `if (${ch('ptr')} !== ${code(
        '"'
      )}) throw new Error('Unexpected token in string')`
    )
  }

  gen(`var i = ${indexOf('"', '++ptr')}`)

  if (validate) {
    gen(`if (i === -1) throw new Error('Unterminated string')`)
  } else {
    gen(`if (i === -1) { return null }`)
  }

  gen(`
    while (${ch('i - 1')} === ${code('\\')}) {
      var cnt = 1
      while (${ch('i - 1 - cnt')} === ${code('\\')}) cnt++
      if ((cnt & 1) === 0) break
      i = ${indexOf('"', 'i + 1')}
  `)

  if (validate) {
    gen(`if (i === -1) throw new Error('Unterminated string')`)
  }

  gen(`
    }

    const slice = ${stringSlice('ptr', 'i')}
    parseString.pointer = i + 1
  `)

  if (unesc) {
    gen(`if (slice.indexOf('\\\\') > -1) return JSON.parse('"' + slice + '"')`)
  }

  gen('return slice')
  gen('}')

  const parseString = gen.toFunction()
  parseString.pointer = 0
  return parseString
}
