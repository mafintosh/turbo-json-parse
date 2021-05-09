const tape = require('tape')
const compile = require('../')

const ALPHA_NUMERIC = []
const ASCII = []

for (var i = 32; i < 127; i++) {
  const c = String.fromCharCode(i)
  if (/[a-z0-9]/i.test(c)) ALPHA_NUMERIC.push(c)
  ASCII.push(c)
}

const SOME_UTF8 = [].concat(ASCII, ['Æ', 'Ø', 'Å'])
const ALPHA = ALPHA_NUMERIC.slice(10)

tape('parse random objects', function (t) {
  for (var i = 0; i < 100; i++) {
    const o = random()
    const parse = compile.from(o)
    const parseBuf = compile.from(o, {buffer: true})

    const objs = [o]
    while (objs.length < 5) objs.push(randomCopy(o, true))
    while (objs.length < 10) objs.push(randomCopy(o, false))

    objs.forEach(function (o) {
      try {
        t.ok(same(parse(JSON.stringify(o)), o), 'parsing random object from string')
      } catch (err) {
        t.fail('Could not parse object: ' + JSON.stringify(o))
        t.end()
        return
      }
      try {
        t.ok(same(parseBuf(Buffer.from(JSON.stringify(o))), o), 'parssing random object from buffer')
      } catch (err) {
        t.fail('Could not parse object from buffer: ' + JSON.stringify(o))
        t.end()
      }
    })
  }

  t.end()
})

function same (a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) return true
  require('fs').writeFileSync('bad.json', JSON.stringify([a, b]))
  return false
}

function randomCopy (o, optional) {
  if (Array.isArray(o)) {
    if (!o.length) return []
    const n = new Array(Math.floor(Math.random() * 10))
    for (var i = 0; i < n.length; i++) {
      n[i] = randomCopy(o[0], optional)
    }
    return n
  }
  if (typeof o === 'object') {
    const n = {}
    for (const k of Object.keys(o)) {
      if (optional && Math.random() < 0.10) {
        if (typeof o[k] === 'number') n[k] = 0
        if (typeof o[k] === 'boolean') n[k] = false
        if (typeof o[k] === 'string') n[k] = ''
        continue
      }
      n[k] = randomCopy(o[k], optional)
    }
    return n
  }
  if (typeof o === 'string') return random(0)
  if (typeof o === 'number') return random(1)
  return random(2)
}

function random (r, optional, depth) {
  if (!depth) depth = 0
  const len = depth < 10 ? 5 : 3
  switch (r === undefined ? Math.floor(Math.random() * len) : r) {
    case 0:
      return Math.random() < 0.5
        ? string(ASCII)
        : string(SOME_UTF8)
    case 1:
      return Math.random() < 0.33
        ? number()
        : Math.random() < 0.33
          ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
          : Math.floor(Math.random() * Number.MIN_SAFE_INTEGER)
    case 2:
      return Math.random() < 0.5
    case 3:
      const obj = {}
      const fields = Math.floor(Math.random() * 10)
      for (var i = 0; i < fields; i++) {
        obj[string(ALPHA_NUMERIC, ALPHA)] = random(undefined, optional, depth + 1)
      }
      return obj
    case 4:
      const arr = new Array(Math.floor(Math.random() * 10))
      if (!arr.length) return arr
      arr[0] = random(undefined, optional, depth + 1)
      for (var j = 1; j < arr.length; j++) {
        arr[j] = randomCopy(arr[0], optional)
      }
      return arr
  }
}

function number () {
  return Math.random() < 0.5
    ? Math.floor(Math.random() * 1e10) / 1e5
    : Math.floor(Math.random() * -1e10) / 1e5
}

function string (alpha, first) {
  if (!first) first = alpha
  const len = Math.floor(Math.random() * 100) + 1
  var s = ''
  for (var i = 0; i < len; i++) {
    s += first[Math.floor(Math.random() * first.length)]
    first = alpha
  }
  return s
}