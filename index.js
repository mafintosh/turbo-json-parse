/* eslint no-new-func: 0 */
'use strict'

const genfun = require('generate-function')

module.exports = function (schema) {
  const gen = genfun()

  const constants = {}

  var tick = 0

  function tmp () {
    return 'tmp' + (tick++)
  }

  function def (type) {
    if (typeof type === 'string') {
      switch (type) {
        case 'string': return '""'
        case 'number': return '0'
        case 'boolean':
        case 'bool': return 'false'
        case 'array': return '[]'
        case 'object': return '{}'
        default: throw new Error('Not default type available')
      }
    }
    return 'undefined'
  }

  function defaultObj (schema, fields) {
    for (var j = 0; j < fields.length; j++) {
      const name = fields[j]
      const sep = j < fields.length - 1 ? ',' : ''
      const child = schema.properties[name]
      gen('%s: %s%s', name, def(child.type), sep)
    }
  }

  function generateString (fieldName, startValueVar) {
    gen(`if (s.charCodeAt(ptr++) !== 34) throw new Error("Cannot parse object")`)
    gen('%s = ptr', startValueVar)
    gen(`while (s.charCodeAt(++ptr) !== 34) ;`)
    gen('ptr += 1')
  }

  function generateNumber (startValueVar) {
    const temp = tmp()
    gen('%s = ptr', startValueVar)
    gen('var %s', temp)
    gen(`for (; ptr < s.length; ptr++) {`)
    gen('%s = s.charCodeAt(ptr)', temp)
    gen(`if (%s > 57 || %s < 48) break`, temp, temp)
    gen('}')
  }

  function generateBoolean (startValueVar) {
    gen('if (s.charCodeAt(ptr) === 116) {')
    gen('if (s.charCodeAt(ptr + 1) !== 114 || s.charCodeAt(ptr + 2) !== 117 || s.charCodeAt(ptr + 3) !== 101) throw new Error("Cannot parse object")')
    gen(`%s = true`, startValueVar)
    gen('ptr += 4')
    gen('} else {')
    gen('if (s.charCodeAt(ptr) !== 102 || s.charCodeAt(ptr + 1) !== 97 || s.charCodeAt(ptr + 2) !== 108 || s.charCodeAt(ptr + 3) !== 115 || s.charCodeAt(ptr + 4) !== 101) throw new Error("Cannot parse object")')
    gen(`%s = false`, startValueVar)
    gen('ptr += 5')
    gen('}')
  }

  function createObj (schema, t) {
    const fields = Object.keys(schema.properties)

    if (!/\./.test(t)) {
      gen('var %s = {', t)
      defaultObj(schema, fields)
      gen('}')
    }
    gen(`if (s.charCodeAt(ptr) !== 123) throw new Error("Cannot parse object")`)
    gen(`if (s.charCodeAt(ptr + 1) === 125) {`)
    gen('ptr += 2')
    gen('} else {')
    const startValueVar = tmp()
    gen('var %s', startValueVar)
    for (var j = 0; j < fields.length; j++) {
      var jj = tmp()
      const fieldName = fields[j]
      constants[jj] = fieldName
      const type = schema.properties[fieldName].type
      gen(`if (%s !== s.slice(ptr + 2, ptr + ${fieldName.length + 2})) throw new Error("Unexpected key")`, jj)
      // gen(`if (s.charCodeAt(ptr + ${fieldName.length + 2}) !== 34) throw new Error("Cannot parse object")`)
      gen(`if (s.charCodeAt(ptr + ${fieldName.length + 3}) !== 58) throw new Error("Cannot parse object")`)
      gen(`ptr += ${fieldName.length + 4}`)
      switch (type) {
        case 'string':
          generateString(fieldName, startValueVar)
          gen(`%s.${fieldName} = s.slice(%s, %s - 1)`, t, startValueVar, 'ptr')
          break
        case 'number':
          generateNumber(startValueVar)
          gen(`%s.${fieldName} = Number(s.slice(%s, %s))`, t, startValueVar, 'ptr')
          break
        case 'boolean':
          generateBoolean(startValueVar)
          gen(`%s.${fieldName} = %s`, t, startValueVar)
          break
        case 'array':
          gen(`if (s.charCodeAt(ptr++) !== 91) throw new Error("Cannot parse object")`)
          gen(`while (s.charCodeAt(ptr) !== 93) {`)
          switch (schema.properties[fieldName].items.type) {
            case 'string':
              generateString(fieldName, startValueVar)
              gen(`%s.${fieldName}.push(s.slice(%s, %s - 1))`, t, startValueVar, 'ptr')
              break
            case 'number':
              generateNumber(startValueVar)
              gen(`%s.${fieldName}.push(Number(s.slice(%s, %s)))`, t, startValueVar, 'ptr')
              break
            case 'boolean':
              generateBoolean(startValueVar)
              gen(`%s.${fieldName}.push(%s)`, t, startValueVar)
              break
          }
          // gen('ptr+=1')
          gen('ptr+=1')
          gen(`if (s.charCodeAt(ptr - 1) === 93) break`)
          gen('}')
          break
        case 'object':
          createObj(schema.properties[fieldName], t + '.' + fieldName)
          break
        default:
          throw new Error('Unknown type: ' + type)
      }
      if (j !== fields.length - 1) {
        gen(`if (s.charCodeAt(ptr) !== 44) throw new Error("Cannot parse object")`)
      } else {
        gen('ptr += 1')
      }
    }
    gen(`}`)
  }

  const t = tmp()
  gen('function parse (s, b) {')
  gen('var ptr = 0')
  switch (schema.type) {
    case 'object':
      createObj(schema, t)
      gen(`if (s.charCodeAt(ptr - 1) !== 125) throw new Error("Cannot parse object")`)
      gen(`if (ptr !== s.length) throw new Error("Object contains extra data")`)
      break
  }
  gen('return %s', t)
  gen('}')

  return gen.toFunction(constants)
}
