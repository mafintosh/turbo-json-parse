const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)

  return compileNull

  function compileNull (gen, prop) {
    if (prop) {
      gen(`
        if (${ch('ptr')} === ${code('null')}) {
          ${prop.set('null', true)}
          ptr += 4
        } else {
          throw new Error('Expected null')
        }
      `)
    } else {
      gen(`
        if(${ch('ptr')} === ${code('null')}) {
          parse.pointer = ptr + 4
          return null
        }
        throw new Error('Expected null')
      `)
    }
  }
}
