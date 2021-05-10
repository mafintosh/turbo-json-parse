
const schema = require('./schema')

const numberCharCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57]

module.exports = compileAnyOf

function compileAnyOf (gen, prop, rawSchema, genany) {
  gen(`switch (s.charCodeAt(ptr)) {`)
  for (let index = 0; index < rawSchema.types.length; index++) {
    const type = rawSchema.types[index]
    gentypecheck(gen, prop, type)
    genany(gen, prop, type)
    gen('break')
  }
  gen('}')
}

function gentypecheck (gen, prop, type) {
  switch (type.type) {
    case schema.STRING:
      gen('case 34:')
      break
    case schema.NUMBER:
      for (const code of numberCharCodes) {
        gen(`case ${code}:`)
      }
      break
    case schema.BOOLEAN:
      gen('case 102:')
      gen('case 116:')
      break
    case schema.OBJECT:
      gen('case 123:')
      break
    case schema.ARRAY:
      gen('case 91:')
      break
    case schema.NULL:
      gen('case 110:')
      break
  }
}
