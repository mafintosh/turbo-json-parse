const genfun = require('generate-function')
const opsDefaults = require('./ops')
const similar = require('./similar')

module.exports = defaults

function defaults (opts) {
  if (!opts) opts = {}

  const { eq, ne, ch, ptr, code } = opsDefaults(opts)
  const buffer = !!opts.buffer
  const fullMatch = opts.fullMatch !== false

  return compile
  
  function compile (gen, offset, fields, genblk, gendef) {
    fields.sort(compare)
    compileSwitch(gen, offset, group(fields.map(toName)), fields, genblk, gendef, '')
  }

  function compileSwitch (gen, off, tree, fields, genblk, gendef, prefix) {
    var offset = off + prefix.length + 1 // + 1 is the "
    var cnt = 0

    const sw = tree.length > 1

    if (sw) {
      gen(`switch (${ch(ptr(offset++))}) {`)
    }

    for (var i = 0; i < tree.length; i++) {
      const t = tree[i]
      const nested = Array.isArray(t)
      const match = nested ? t[0] : t
      const more = fullMatch && match.length > 1
      
      if (sw) {
        gen(`case ${code(match[0])}:`)
        if (more) gen(`if (${eq(match.slice(1), offset)}) {`)
      } else {
        if (fullMatch) gen(`if (${eq(match, offset)}) {`)
      }

      if (nested) compileSwitch(gen, off, t[1], genblk, prefix + match)
      else genblk(fields[cnt++], off + prefix.length + match.length, gen)

      if (sw) {
        if (more) {
          if (gendef) {
            gen('} else {')
            gendef(gen)
            gen('}')
          } else {
            gen('}')
          }
        }
        gen('break')
      } else {
        if (fullMatch) {
          if (gendef) {
            gen('} else {')
            gendef(gen)
            gen('}')
          } else {
            gen('}')
          }
        }
      }
    }

    if (sw) {
      if (gendef) {
        gen('default:')
        gendef(gen)
      }
      gen('}')
    }
  }
}

function compare (a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
}

function toName (field) {
  return field.name + '"'
}

function group (strings) {
  const tree = []

  while (strings.length) {
    const s = strings[0]
    var min = -1

    for (var i = 1; i < strings.length; i++) {
      const c = similar(s, strings[i])
      if (c === 0) break
      if (c < min || min === -1) min = c
    }

    if (min === -1) {
      tree.push(s)
      strings.shift()
      continue
    }
    tree.push([s.slice(0, min), group(strings.slice(0, i).map(s => s.slice(min)))])
    strings = strings.slice(i)
  }
  return tree
}
