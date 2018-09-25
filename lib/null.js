const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)
  const fullMatch = opts.fullMatch !== false

  return compileNull

  function compileNull (gen, prop) {
    if (fullMatch) {
      if (prop) {
        gen(`
          ${prop.set('null', true)}
          ptr += 4
        `)
      } else {
        gen(`
          ptr += 4
        `)
      }
    } else {
      if (prop) {
        gen(`
          if (${ch('ptr')} === ${code('null')}) {
            ${prop.set('null', true)}
            ptr += 4
          }
        `)
      } else {
        gen(`
          if(${ch('ptr')} === ${code('null')}) {
            ptr += 4
            return null
          }
        `)
      }
    }
  }
}
