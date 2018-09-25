const ops = require('./ops')

module.exports = defaults

function defaults (opts) {
  const { ch, code } = ops(opts)
  const buffer = !!opts.buffer

  return compileArbitraryJSON

  function compileArbitraryJSON (gen, prop, rawSchema, compileAny) {
    const {indexOf, stringSlice} = ops({buffer})

    gen(`
      let arbjson = 0
      let startjson = ptr
      do {
        if (${ch('ptr')} === ${code('"')}) {
          var i = ${indexOf('"', '++ptr')}

          while (${ch('i - 1')} === ${code('\\')}) {
            var cnt = 1
            while (${ch('i - 1 - cnt')} === ${code('\\')}) cnt++
            if ((cnt & 1) === 0) break
            i = ${indexOf('"', 'i + 1')}
          }
          ptr = i
        }
        else if (${ch('ptr')} === ${code('{')}) ++arbjson
        else if (${ch('ptr')} === ${code('}')}) --arbjson
        ptr += 1
      } while (arbjson > 0)

      const slice = ${stringSlice('startjson', 'ptr')}
      ${prop.parent}.${prop.name} = JSON.parse(slice)
    `)
  }
}
