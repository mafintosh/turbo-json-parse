const ops = require('./ops')
const Property = require('./property')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)

  const allowEmptyArrays = opts.allowEmptyArrays !== false

  return compileArray

  function compileArray (gen, prop, rawSchema, compileAny) {
    const assigning = !prop || !prop.getable
    const allowEmpty = rawSchema.allowEmpty !== false && allowEmptyArrays

    const a = assigning ? gen.sym(rawSchema.name || 'arr') : prop.get()

    if (assigning) {
      gen(`const ${a} = []`)
    }

    if (allowEmpty) {
      gen(`
        if (${ch('ptr + 1')} === ${code(']')}) {
          ptr += 2
        } else {
      `)
    }

    gen(`while (${ch('ptr++')} !== ${code(']')}) {`)

    if (!rawSchema.items) {
      gen(`throw new Error('Unknown array type')`)
    } else {
      const arrProp = new Property(gen, a, rawSchema.items)
      compileAny(gen, arrProp, rawSchema.items)
    }

    gen('}')

    if (allowEmpty) {
      gen('}')
    }

    if (!prop) gen(`return ${a}`)
    else if (assigning) prop.set(a)
  }
}
