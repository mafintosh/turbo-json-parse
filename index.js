const genfun = require('generate-function')

compile.schema = types
module.exports = compile

function def (type) {
  if (typeof type === 'string') {
    switch (type) {
      case 'string': return '""'
      case 'number': return '0'
      case 'boolean':
      case 'bool': return 'false'
      default: throw new Error('No default type available')
    }
  }
  return 'undefined'
}

function endNumberString (s, ptr) {
  for (; ptr < s.length; ptr++) {
    switch (s.charCodeAt(ptr)) {
      case 44:
      case 93:
      case 125:
      return ptr
    }
  }
  throw new Error('Could not find end of number')
}

function endNumberBuffer (b, ptr) {
  for (; ptr < b.length; ptr++) {
    switch (b[ptr]) {
      case 44:
      case 93:
      case 125:
      return ptr
    }
  }
  throw new Error('Could not find end of number')
}

function indexOfString (s, val, offset) {
  const i = s.indexOf(val, offset)
  if (i === -1) throw new Error('Could not parse value')
  return i
}

function indexOfKey (keys, val, offset) {
  const i = keys.indexOf(val, offset)
  if (i === -1) throw new Error('Unknown key: ' + val)
  return i
}

function types (obj) {
  const t = typeof obj
  switch (t) {
    case 'number': return 'number'
    case 'string': return 'string'
    case 'boolean': return 'boolean'
  }

  if (!obj) throw new Error('Cannot infer type')

  if (Array.isArray(obj)) {
    return [types(obj[0])]
  }

  const schema = {}

  for (const k of Object.keys(obj)) {
    schema[k] = types(obj[k])
  }

  return schema
}

function isObject (v) {
  return typeof v === 'object' && !Array.isArray(v)
}

function bool (v, def) {
  return typeof v === 'boolean' ? v : def
}

function stringUnescape (s) {
  if (s.indexOf('\\') === -1) return s
  return slowStringUnescape(s)
}

function slowStringUnescape (s) {
  return JSON.parse('"' + s + '"') // slow path but unlikely
}

function compile (schema, opts) {
  if (!opts) opts = {}

  const unsafe = bool(opts.unsafe, false)
  const validate = bool(opts.validate, !unsafe)
  const optional = bool(opts.optional, true)
  const unescapeStrings = bool(opts.unescapeStrings, true)
  const validateKeys = bool(opts.validateKeys, !unsafe)
  const validateLength = bool(opts.validateLength, !unsafe)
  const buffer = !!opts.buffer

  var tick = 0
  var incs = 0
  var absVar = ''
  var declaredPtr = false

  const constants = {endNumber, indexOfString, indexOfKey, endNumberBuffer, endNumberString, stringUnescape}
  const gen = genfun()

  if (typeof schema !== 'object') throw new Error('Only object or array schemas supported')

  gen('function parse (s, b) {')
  compileType(null, schema, gen)
  gen('}')

  return gen.toFunction(constants)

  function inc (n, abs) {
    if (abs) {
      absVar = abs
      incs = n
    } else {
      incs += n
    }
  }

  function flush () {
    const decl = declaredPtr ? 'ptr' : 'var ptr'
    if (absVar) {
      gen('%s = %s + %d', decl, absVar, incs)
      incs = 0
      absVar = ''
    } else if (incs) {
      const plus = declaredPtr ? '+=' : '='
      gen('%s %s %d', decl, plus, incs)
      incs = 0
    } else if (!declaredPtr) {
      gen('%s = 0', decl)
    }
    declaredPtr = true
  }

  function tmp () {
    return 'tmp' + (tick++)
  }

  function defaultObj (obj, fields) {
    for (var j = 0; j < fields.length; j++) {
      const name = fields[j]
      const sep = j < fields.length - 1 ? ',' : ''
      const child = obj[name]
      if (isObject(child) && !optional) {
        gen('%s: {', name)
        defaultObj(child, Object.keys(child))
        gen('}%s', sep)
      } else if (Array.isArray(child) && !optional) {
        gen('%s: []%s', name, sep)
      } else {
        gen('%s: %s%s', name, def(child), sep)
      }
    }
  }

  function ch (i) {
    return buffer ? 'b[' + i + ']' : 's.charCodeAt(' + i + ')'
  }

  function idxOf (ch, offset) {
    // buffer.indexOf seems to always be slower than s.indexOf?
    // 'indexOfBuffer(b, ' + ch + ', ' + offset + ')'
    return 'indexOfString(s, ' + JSON.stringify(String.fromCharCode(ch)) + ', ' + offset + ')'
  }

  function compareKey (f, fields, i, offset, eq) {
    const name = fields[i]
    const cmp = eq ? ' === ' : ' !== '
    const join = eq ? ' && ' : ' || '

    if (buffer) {
      const s = eq ? 'ptr + ' + (name.length + offset) + ' < b.length' + join : ''
      return s + name.split('').map(function (ch, j) {
        const ptr = offset + j ? 'ptr + ' + (offset + j) : 'ptr'
        return 'b[' + ptr + ']' + cmp + ch.charCodeAt(0)
      }).join(join)
    }

    const end = name.length + offset
    return f + '[' + i + ']' + cmp + 's.slice(ptr + ' + offset + ', ptr + ' + end + ')'
  }

  function compileObject (assign, obj, gen, parent) {
    const t = tmp()
    const f = tmp()
    const fields = constants[f] = Object.keys(obj)

    if (parent) {
      gen('const %s = %s', t, parent)
    } else {
      gen('const %s = {', t)
      defaultObj(obj, fields)
      gen('}')
    }

    if (fields.length === 0) {
      inc(2)
    } else {
      if (validate) {
        flush()
        gen(`if (${ch('ptr')} !== 123) throw new Error("Cannot parse object")`)
      }
      if (optional) {
        flush()
        gen(`if (${ch('ptr + 1')} === 125) {`)
          ('ptr += 2')
        gen('} else {')
      }

      for (var j = 0; j < fields.length; j++) {
        const name = fields[j]
        const type = obj[name]
        const parent = t + '.' + name
        const assign = val => parent + ' = ' + val
        const offset = (!optional && j === 0) ? 1 : 0
        if (j === 0 && optional) inc(1)
        if (optional) {
          flush()
          gen('if (%s) {', compareKey(f, fields, j, offset + 1, true))
        } else if (validateKeys) {
          flush()
          gen('if (%s) throw new Error("Missing key: %s")', compareKey(f, fields, j, offset + 1), name)
        }
        if (validate) {
          flush()
          gen(`if (${ch('ptr + %d')} !== 58) throw new Error("Cannot parse object")`, name.length + 2 + offset)
        }
        inc(name.length + 3 + offset)
        compileType(assign, type, gen, !optional && parent)
        if (optional) {
          flush()
          gen('}')
        }
      }

      if (optional) gen('}')
    }

    if (assign) {
      inc(1)
      if (!parent) gen(assign(t))
      return
    }

    if (validate) {
      flush()
      gen(`if (${ch('ptr - 1')} !== 125) throw new Error("Cannot parse object")`)
    }

    if (validateLength) {
      flush()
      gen('if (ptr !== s.length) throw new Error("Object contains extra data")')
    }

    gen('return %s', t)
  }

  function compileType (assign, type, gen, parent) {
    if (typeof type === 'string') {
      switch (type) {
        case 'string': return compileString(assign, gen, parent)
        case 'number': return compileNumber(assign, gen, parent)
        case 'boolean':
        case 'bool': return compileBool(assign, gen, parent)
        default: throw new Error('Unknown type: ' + type)
      }
    }

    if (Array.isArray(type)) return compileArray(assign, type[0], gen, parent)
    return compileObject(assign, type, gen, parent)
  }

  function compileArray (assign, type, gen, parent) {
    const t = tmp()

    if (parent) {
      gen('const %s = %s', t, parent)
    } else {
      gen('const %s = []', t)
    }

    if (validate) {
      flush()
      gen(`if (${ch('ptr')} !== 91) throw new Error("Cannot parse array")`)
    }

    flush()
    gen(`if (++ptr < s.length && ${ch('ptr')} !== 93) {`)
      ('do {')

    compileType(val => t + '.push(' + val + ')', type, gen)
    flush()

    gen(`} while (ptr < s.length && ${ch('ptr - 1')} !== 93)`)
      ('}')

    if (assign) {
      inc(1)
      if (!parent) gen(assign(t))
      return
    }

    if (validate) {
      gen(`if (${ch('ptr - 1')} !== 93) throw new Error("Cannot parse array")`)
    }

    if (validateLength) {
      flush()
      gen('if (ptr !== s.length) throw new Error("Object contains extra data")')
    }

    gen('return %s', t)
  }

  function compileString (assign, gen) {
    flush()

    const t = tmp()

    if (validate) {
      gen(`if (${ch('ptr')} !== 34) throw new Error("Cannot parse string")`)
    }

    gen(`var %s = ${idxOf(34, '++ptr')}`, t)

    gen(`while (${ch('%s - 1')} === 92) {`, t)
      (`%s = ${idxOf(34, '%s + 1')}`, t, t)
    gen('}')

    if (unescapeStrings) {
      gen(assign('stringUnescape(s.slice(ptr, %s))'), t)
    } else {
      gen(assign('s.slice(ptr, %s)'), t)
    }
    inc(2, t)
  }

  function endNumber (ptr) {
    return buffer
      ? 'endNumberBuffer(b, ' + ptr + ')'
      : 'endNumberString(s, ' + ptr + ')'
  }

  function compileNumber (assign, gen, parent) {
    flush()

    const t = tmp()
    const n = parent || tmp()
    const decl = parent ? n : 'const ' + n

    gen(`const %s = ${endNumber('ptr')}`, t)
    gen('%s = Number(s.slice(ptr, %s))', decl, t)

    if (validate) {
      gen('if (isNaN(%s)) throw new Error("Cannot parse number")', n)
    }

    if (!parent) gen(assign('%s'), n)
    inc(1, t)
  }

  function compileBool (assign, gen) {
    flush()

    gen(`if (${ch('ptr')} === 116) {`)
      (assign('true'))
      ('ptr += 5')

    if (validate) {
      gen(`} else if (${ch('ptr')} === 102) {`)
        (assign('false'))
        ('ptr += 6')
      ('} else {')
        ('throw new Error("Could not parse boolean")')
      ('}')
    } else {
      gen('} else {')
        (assign('false'))
        ('ptr += 6')
      ('}')
     }
  }
}
