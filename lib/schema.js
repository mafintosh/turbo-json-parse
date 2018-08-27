const STRING = exports.STRING = 0
const NUMBER = exports.NUMBER = 1
const BOOLEAN = exports.BOOLEAN = 2
const ARRAY = exports.ARRAY = 3
const OBJECT = exports.OBJECT = 4
const UNKNOWN = exports.UNKNOWN = 5

exports.inferRawSchema = (obj, opts) => inferRawSchema(obj, opts || {}, null)

function type (val) {
  if (Array.isArray(val)) return ARRAY
  switch (typeof val) {
    case 'string': return STRING
    case 'number': return NUMBER
    case 'boolean': return BOOLEAN
    case 'object': return val ? OBJECT : UNKNOWN
  }
  return UNKNOWN
}

function inferRawSchema (obj, opts, name) {
  const t = type(obj)
  const prop = {
    type: t,
    name: name || null,
    required: !!opts.required,
    ordered: !!opts.ordered,
    allowEmpty: opts.allowEmpty !== false,
    fields: null,
    items: null
  }

  if (t === OBJECT) {
    prop.fields = []
    for (const key of Object.keys(obj)) {
      prop.fields.push(inferRawSchema(obj[key], opts, key))
    }
    return prop
  }

  if (t === ARRAY) {
    prop.items = obj.length ? inferRawSchema(obj[0], opts, null) : null
    return prop
  }

  return prop
}
