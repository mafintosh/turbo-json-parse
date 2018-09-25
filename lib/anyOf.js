
const schema = require('./schema')

module.exports = compileAnyOf

function compileAnyOf (gen, prop, rawSchema, genany) {
  gen('const codeAtPtr = s.charCodeAt(ptr)')
  for (let index = 0; index < rawSchema.types.length; index++) {
    const type = rawSchema.types[index]
    gentypecheck(gen, prop, type, index)
    genany(gen, prop, type)
  }
  gen('}')
}

function gentypecheck (gen, prop, type, index) {
  const elseIf = index === 0 ? '' : '} else '
  switch (type.type) {
    case schema.STRING:
      gen(elseIf + 'if (codeAtPtr === 34) {')
      break
    case schema.NUMBER:
      gen(elseIf + 'if ([48, 49, 50, 51, 52, 53, 54, 55, 56, 57].includes(codeAtPtr)) {')
      break
    case schema.BOOLEAN:
      gen(elseIf + 'if ([102, 116].includes(codeAtPtr)) {')
      break
    case schema.OBJECT:
      gen(elseIf + 'if (codeAtPtr === 123) {')
      break
    case schema.ARRAY:
      gen(elseIf + 'if (codeAtPtr === 91) {')
      break
    case schema.NULL:
      gen(elseIf + 'if (codeAtPtr === 110) {')
      break
  }
}
