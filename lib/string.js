const genfun = require('generate-function')
const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const buffer = opts.buffer
  const s = buffer ? 'b' : 's'
  const unesc = opts.unescapeStrings !== false
  const validate = opts.validateStrings !== false

  return compileString

  function compileString (gen, prop) {
    if (!gen.scope.parseString) {
      gen.scope.parseString = genparser(buffer, validate, unesc)
    }

    if (prop) {
      prop.set(`parseString(${s}, ptr)`)
      gen('ptr = parseString.pointer')
    } else {
      gen(`return parseString(${s}, ptr)`)
    }
  }
}

function genparser (buffer, validate, unesc) {
  const {name, ch, indexOf, code, stringSlice} = ops({buffer})
  const gen = genfun()
  
  gen(`function parseString (${name}, ptr) {`)
  
  if (validate) {
    gen(`if (${ch('ptr')} !== ${code('"')}) throw new Error('Unexpected token in string')`)
  }

  gen(`
    var i = ${indexOf('"', '++ptr')}
    if (i === -1) throw new Error('Unterminated string')

    while (${ch('i - 1')} === ${code('\\')} && ${ch('i - 2')} !== ${code('\\')}) {
      i = ${indexOf('"', 'i + 1')}
      if (i === -1) throw new Error('Unterminated string')
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

function parseStringBuffer (b, ptr) {
  if (b[ptr] !== 34) throw new Error('Not a string')

  var i = b.indexOf(34, ++ptr)
  if (i === -1) throw new Error('Cannot find string')

  while (b[i - 1] === 92 && b[i - 2] !== 92) {
    i = b.indexOf(34, i + 1)
    if (i === -1) throw new Error('Cannot find string')
  }

  const sl = b.utf8Slice(ptr, i)
  if (sl.indexOf('\\') > -1) return JSON.parse('"' + sl + '"')
  return sl
}

function parseStringString (s, ptr) {
  if (s.charCodeAt(ptr) !== 34) throw new Error('Not a string')

  var i = s.indexOf('"', ++ptr)
  if (i === -1) throw new Error('Not a string')

  while (s.charCodeAt(i - 1) === 92 && s.charCodeAt(i - 2) !== 92) {
    i = s.indexOf('"', i + 1)
    if (end === -1) throw new Error('Not a string')
  }

  const sl = s.slice(ptr, i)
  if (sl.indexOf('\\') > -1) return JSON.parse('"' + sl + '"')
  return sl
}
