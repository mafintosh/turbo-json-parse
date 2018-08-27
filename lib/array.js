const ops = require('./ops')
const Property = require('./property')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)

  const allowEmptyArrays = opts.allowEmptyArrays !== false

  return compileArray

  function compileArray (gen, prop, schema, compileAny) {
    const assigning = !prop || !prop.getable
    const allowEmpty = schema.allowEmpty !== false && allowEmptyArrays

    const a = assigning ? gen.sym(schema.name || 'arr') : prop.get()

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

    const arrProp = new Property(gen, a, schema.items)

    compileAny(gen, arrProp, schema.items)
    
    gen('}')

    if (allowEmpty) {
      gen('}')
    }


    if (!prop) gen(`return ${a}`)
    else if (assigning) prop.set(a)
  }
}
