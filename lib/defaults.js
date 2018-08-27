function defaults (gen, name, schema) {
  if (schema.type === 'array') {
    gen(`const ${name} = []`)
    return
  }

  gen(`const ${name} = {`)

  const fields = schema.fields || []
}
