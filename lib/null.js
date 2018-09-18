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
          switch (${ch('ptr')}) {
            case ${code('null')}:
            ${prop.set('null', null)}
            ptr += 4
            break
            default:
            throw new Error("Unexpected token in null")
          }
        `)
      } else {
        gen(`
          switch (${ch('ptr')}) {
            case ${code('null')}:
            parse.pointer = ptr + 4
            return null
            default:
            throw new Error("Unexpected token in null")
          }
        `)
      }
    } else {
      if (prop) {
        gen(`
          if (${ch('ptr')} === ${code('null')}) {
            ${prop.set('null', null)}
            ptr += 4
          }
        `)
      } else {
        gen(`
          if(${ch('ptr')} === ${code('null')}) {
            parse.pointer = ptr + 4
            return null
          }
        `)
      }
    }
  }
}
