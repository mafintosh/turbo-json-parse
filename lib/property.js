module.exports = class Property {
  constructor(gen, object, field) {
    this.name = field.name || null
    this.parent = object || null
    this.key = this.name ? gen.property(object, this.name) : null
    this.getable = field.required && !!this.key
    this.gen = gen
  }

  set (val, src) {
    let code = `parsed_value = ${val};\n`
    code += this.key
      ? `if (parsed_value) {\n ${this.key} = parsed_value \n}`
      : `if (parsed_value) {\n${this.parent}.push(parsed_value) \n}`
    code += ` else {\ncontinue\n}`
    if (src) return code
    this.gen(code)
  }

  get () {
    if (!this.getable) throw new Error('Property is not getable')
    const sym = this.gen.sym(this.name)
    this.gen(`const ${sym} = ${this.key}`)
    return sym
  }
}
