const genfun = require('generate-function')
const schema = require('./lib/schema')
const anyDefaults = require('./lib/any')
const ops = require('./lib/ops')

exports = module.exports = compile
exports.inferRawSchema = schema.inferRawSchema
exports.jsonSchemaToRawSchema = schema.jsonSchemaToRawSchema
exports.from = from

function from (obj, opts) {
  return compile(schema.inferRawSchema(obj), opts)
}

function compile (jsonSchema, opts) {
  if (!opts) opts = {}

  const isRawSchema = typeof jsonSchema.type === 'number'
  const rawSchema = isRawSchema
    ? jsonSchema
    : schema.jsonSchemaToRawSchema(jsonSchema)

  const { name } = ops(opts)
  const any = anyDefaults(opts)

  const gen = genfun()
  gen.scope.console = console

  // just to reserve these symbols
  gen.sym(name)
  gen.sym('ptr')
  gen.sym('parseString')
  gen.sym('parseNumber')

  gen(`function parse (${name}, ptr) {`)
  gen('if (!ptr) ptr = 0')
  gen(`let parsed_value;`)
  any(gen, null, rawSchema)
  gen('}')

  const parse = gen.toFunction()
  parse.pointer = 0
  return parse
}
