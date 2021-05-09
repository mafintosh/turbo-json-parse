const opsDefaults = require('./ops')
const similar = require('./similar')

module.exports = defaults

function defaults (opts) {
  if (!opts) opts = {}

  const { eq, ch, ptr, code, validate } = opsDefaults(opts)
  const fullMatch = opts.fullMatch !== false

  return compileSwitch

  function compileSwitch (gen, off, fields, genblk, gendef) {
    var cnt = 0
    fields.sort(compare)
    visitSwitch(group(fields.map(toName)), '')

    function visitSwitch (tree, prefix) {
      var offset = off + prefix.length + 1 // + 1 is the "

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

        if (nested) visitSwitch(t[1], prefix + match)
        else genblk(fields[cnt++], off + prefix.length + match.length, gen)

        if (sw) {
          if (more) {
            if (gendef) {
              gen('} else {')
              gendef(gen, ` as not found any more fields`, validate)
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
              gendef(gen, ` as no full-match`, validate)
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
          gendef(gen, `, something got wrong`, validate)
        }
        gen('}')
      }
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
    tree.push([
      s.slice(0, min),
      group(strings.slice(0, i).map((s) => s.slice(min))),
    ])
    strings = strings.slice(i)
  }
  return tree
}
