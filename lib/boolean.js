const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)
  const fullMatch = opts.fullMatch !== false

  return compileBoolean

  function compileBoolean (gen, prop) {
    if (fullMatch) {
      if (prop) {
        gen(`
          switch (${ch('ptr')}) {
            case ${code('t')}:
            ${prop.set('true', true)}
            ptr += 5
            break
            case ${code('f')}:
            ${prop.set('false', true)}
            ptr += 6
            break
            default:
            throw new Error("Unexpected token in boolean")
          }
        `)
      } else {
        gen(`
          switch (${ch('ptr')}) {
            case ${code('t')}:
            return true
            case ${code('f')}:
            return false
            default:
            throw new Error("Unexpected token in boolean")
          }
        `)
      }
    } else {
      if (prop) {
        gen(`
          if (${ch('ptr')} === ${code('t')}) {
            ${prop.set('true', true)}
            ptr += 5
          } else {
            ${prop.set('false', true)}
            ptr += 6
          }
        `)
      } else {
        gen(`return ${ch('ptr')} === ${code('t')}`)
      }
    }
  }
}

