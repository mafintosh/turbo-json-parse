const genfun = require('generate-function')
const schema = require('./lib/schema')
const anyDefaults = require('./lib/any')
const ops = require('./lib/ops')

exports = module.exports = compile
exports.inferRawSchema = schema.inferRawSchema

function compile (rawSchema, opts) {
  if (!opts) opts = {}

  const { name } = ops(opts)
  const any = anyDefaults(opts)

  const gen = genfun()
  gen.scope.console = console
  gen(`function parse (${name}, ptr) {`)
  gen('if (!ptr) ptr = 0')
  any(gen, null, rawSchema)
  gen('}')

  return gen.toFunction()
}
