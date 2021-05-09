const switchDefaults = require('./switch')
const opsDefaults = require('./ops')
const Property = require('./property')
const similar = require('./similar')
const schema = require('./schema')

module.exports = defaults

function defaults (opts) {
  if (!opts) opts = {}

  const allowEmptyObjects = opts.allowEmptyObjects !== false
  const required = !!opts.allRequired
  const validate = opts.validate !== false
  const ordered = !!opts.ordered
  const fullMatch = opts.fullMatch !== false
  const defaults = opts.defaults !== false
  const prettyPrinted = !!opts.prettyPrinted

  const sw = switchDefaults(opts)
  const { eq, ch, code } = opsDefaults(opts)

  class Required {
    constructor(gen, o, fields) {
      this.name = o + 'Required'
      this.fields = validate ? fields.filter(isRequired) : []
      this.count = this.fields.length
      this.gen = gen
      this.vars = []
    }

    setup () {
      if (!this.count) return
      if (this.count === 1) {
        const sym = this.gen.sym(this.name)
        this.vars.push(sym)
        this.gen(`const ${sym} = false`)
      } else {
        const vars = Math.ceil(this.count / 32)
        for (var i = 0; i < vars; i++) {
          const sym = this.gen.sym(this.name)
          this.vars.push(sym)
          this.gen(`const ${sym} = 0`)
        }
      }
    }

    set (field) {
      if (!isRequired(field)) return
      const idx = this.fields.indexOf(field)
      const v = this.vars[Math.floor(idx / 32)]
      if (this.count === 1) {
        this.gen(`${v} = true`)
      } else {
        const mask = (1 << (idx & 31)) >>> 0
        this.gen(`${v} |= ${mask}`)
      }
    }

    mask (i) {
      const all = Math.pow(2, 32) - 1
      if (i < this.vars.length - 1) return all

      return this.count & 31 ? (Math.pow(2, this.count & 31) - 1) >>> 0 : all
    }

    validate () {
      if (!this.count) return
      if (this.count === 1) {
        this.gen(`if (!${this.vars[0]}) {`)
      } else {
        const vs = this.vars
          .map((v, i) => `${v} !== ${this.mask(i)}`)
          .join(' || ')
        this.gen(`if (${vs}) {`)
      }
      this.gen(`throw new Error('Missing required key in object')`)
      this.gen('}')
    }
  }

  return compileObject

  function compileObject (gen, prop, rawSchema, genany) {
    const fields = rawSchema.fields || []
    const assigning = !prop || !prop.getable
    const allowEmpty =
      !fields.some(isRequired) &&
      rawSchema.allowEmpty !== false &&
      allowEmptyObjects

    const o = assigning ? gen.sym(rawSchema.name || 'o') : prop.get()
    const reqs = new Required(gen, o, fields)

    if (assigning) {
      defaultObject(gen, o, rawSchema)
    }

    if (allowEmpty) {
      gen(`
        if (${ch('ptr + 1')} === ${code('}')}) {
          ptr += 2
        } else {
      `)
    }

    if (!fields.length) {
      gen(`
        throw new Error('Unexpected token in object, no fields was found')
      `)
    } else if (bool(rawSchema.ordered, ordered)) {
      genifs(gen, o, fields, genany)
      gen(`
        if (${ch('ptr++')} !== ${code('}')}) {
          throw new Error('Unexpected token in object, orders are mismatched')
        }
      `)
    } else {
      reqs.setup()
      gen(`while (${ch('ptr++')} !== ${code('}')}) {`)
      if (prettyPrinted) {
        gen(
          `if (${ch('ptr')} === ${code(' ')} || ${ch('ptr')} === ${code(
            '\n'
          )}) continue`
        )
      }

      sw(gen, 0, fields, genblk, gendef)
      gen('}')
      reqs.validate()
    }

    if (allowEmpty) {
      gen('}')
    }

    if (!prop) {
      gen(`
        parse.pointer = ptr
        return ${o}
      `)
    } else if (assigning) {
      prop.set(o)
    }

    function genblk (field, offset, gen) {
      gen(`ptr += ${offset + 1 + 1}`)
      if (prettyPrinted) {
        gen(
          `if (${ch('ptr')} === ${code(' ')} || ${ch('ptr')} === ${code(
            '\n'
          )}) ptr++`
        )
      }
      reqs.set(field)
      genany(gen, new Property(gen, o, field), field)
      if (prettyPrinted) {
        gen(
          `while (${ch('ptr')} === ${code(' ')} || ${ch('ptr')} === ${code(
            '\n'
          )}) ptr++`
        )
      }
    }
  }

  function gendef (gen, reason, validate) {
    if (validate) {
      gen(`throw new Error('Unexpected key in object${reason}')`)
    }
  }

  function genif (gen, o, fields, i, genany) {
    const field = fields[i]
    var name = field.name + '"'

    if (!fullMatch) {
      var max = 1
      for (var n = i + 1; n < fields.length; n++) {
        const other = fields[n].name + '"'
        const sim = similar(name, other)
        if (sim > max) max = sim
      }
      name = name.slice(0, max)
    }

    gen(`if (${eq(name, 2)}) {`)
    gen(`ptr += ${1 + field.name.length + 2 + 1}`)
    genany(gen, new Property(gen, o, field), field)
    if (isRequired(field)) {
      gen(`
        } else {
          throw new Error("Missing required key: ${field.name}")
        }
      `)
    } else {
      gen('}')
    }
  }

  function genifs (gen, o, fields, genany) {
    for (var i = 0; i < fields.length; i++) genif(gen, o, fields, i, genany)
  }

  function isRequired (field) {
    return bool(field.required, required)
  }

  function defaultObject (gen, name, rawSchema) {
    if (!defaults) {
      gen(`const ${name} = {}`)
    } else {
      gen(`const ${name} = {`)
      defaultFields(gen, rawSchema.fields)
      gen('}')
    }
  }

  function defaultFields (gen, fields) {
    if (!fields) fields = []

    for (var i = 0; i < fields.length; i++) {
      const f = fields[i]
      const s = i < fields.length - 1 ? ',' : ''

      switch (f.type) {
        case schema.STRING:
          gen(`${gen.property(f.name)}: ${JSON.stringify(f.default || '')}${s}`)
          break
        case schema.NUMBER:
          gen(`${gen.property(f.name)}: ${f.default || 0}${s}`)
          break
        case schema.BOOLEAN:
          gen(`${gen.property(f.name)}: ${f.default || false}${s}`)
          break
        case schema.NULL:
          gen(`${gen.property(f.name)}: ${f.default || null}${s}`)
          break
        case schema.ARRAY:
          if (isRequired(f)) {
            gen(`${gen.property(f.name)}: []${s}`)
          } else {
            gen(`${gen.property(f.name)}: undefined${s}`)
          }
          break
        case schema.OBJECT:
          if (isRequired(f)) {
            gen(`${gen.property(f.name)}: {`)
            defaultFields(gen, f.fields)
            gen(`}${s}`)
          } else {
            gen(`${gen.property(f.name)}: undefined${s}`)
          }
          break
      }
    }
  }
}

function bool (b, def) {
  if (b === undefined) return def
  return b
}
