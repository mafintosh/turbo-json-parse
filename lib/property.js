module.exports = class Property {
  constructor (gen, object, field) {
    this.name = field.name || null
    this.parent = object || null
    this.key = this.name ? gen.property(object, this.name) : null
    this.getable = field.required && !!this.key
    this.gen = gen
  }

  set (val, src) {
    const code = this.key ? `${this.key} = ${val}` : `${this.parent}.push(${val})`
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
