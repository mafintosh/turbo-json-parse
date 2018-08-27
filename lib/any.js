const objectDefaults = require('./object')
const numberDefaults = require('./number')
const stringDefaults = require('./string')
const booleanDefaults = require('./boolean')
const arrayDefaults = require('./array')

module.exports = defaults

function defaults (opts) {
  const compileString = stringDefaults(opts)
  const compileNumber = numberDefaults(opts)
  const compileBoolean = booleanDefaults(opts)
  const compileObject = objectDefaults(opts)
  const compileArray = arrayDefaults(opts)

  return compileAny

  function compileAny (gen, prop, schema) {
    switch (schema.type) {
      case 'string':
      compileString(gen, prop)
      break

      case 'number':
      compileNumber(gen, prop)
      break

      case 'boolean':
      compileBoolean(gen, prop)
      break

      case 'object':
      compileObject(gen, prop, schema, compileAny)
      break

      case 'array':
      compileArray(gen, prop, schema, compileAny)
      break
    }
  }
}
