
const schema = require('./schema')

module.exports = compileAnyOf

function compileAnyOf (gen, prop, rawSchema, genany) {
  const sym = gen.sym('codeAtPtr')
  gen(`const ${sym} = s.charCodeAt(ptr)`)
  for (let index = 0; index < rawSchema.types.length; index++) {
    const type = rawSchema.types[index]
    gentypecheck(gen, prop, type, index, sym)
    genany(gen, prop, type)
  }
  gen('}')
}

function gentypecheck (gen, prop, type, index, sym) {
  const elseIf = index === 0 ? '' : '} else '
  switch (type.type) {
    case schema.STRING:
      gen(elseIf + `if (${sym} === 34) {`)
      break
    case schema.NUMBER:
      gen(elseIf + `if ([48, 49, 50, 51, 52, 53, 54, 55, 56, 57].includes(${sym})) {`)
      break
    case schema.BOOLEAN:
      gen(elseIf + `if ([102, 116].includes(${sym})) {`)
      break
    case schema.OBJECT:
      gen(elseIf + `if (${sym} === 123) {`)
      break
    case schema.ARRAY:
      gen(elseIf + `if (${sym} === 91) {`)
      break
    case schema.NULL:
      gen(elseIf + `if (${sym} === 110) {`)
      break
  }
}
