const ops = require('./ops')

parseNumberString.pointer = 0
parseNumberBuffer.pointer = 0

module.exports = defaults

function defaults (opts) {
  const { buffer, validate } = opts
  const { name } = ops(opts)

  return compileNumber

  function compileNumber (gen, prop) {
    if (!gen.scope.parseNumber) {
      gen.scope.parseNumber = buffer ? parseNumberBuffer : parseNumberString
    }

    if (prop) {
      prop.set(`parseNumber(${name}, ptr, ${validate})`)
      gen('ptr = parseNumber.pointer')
    } else {
      const num = gen.sym('num')
      gen(`
        const ${num} = parseNumber(${name}, ptr, ${validate})
        parse.pointer = parseNumber.pointer
        return ${num}
      `)
    }
  }
}

function parseFloatString (n, buf, ptr) {
  var num = 0
  var div = 1
  while (ptr < buf.length) {
    div *= 10
    switch (buf.charCodeAt(ptr++)) {
      case 48:
        num = num * 10
        continue
      case 49:
        num = num * 10 + 1
        continue
      case 50:
        num = num * 10 + 2
        continue
      case 51:
        num = num * 10 + 3
        continue
      case 52:
        num = num * 10 + 4
        continue
      case 53:
        num = num * 10 + 5
        continue
      case 54:
        num = num * 10 + 6
        continue
      case 55:
        num = num * 10 + 7
        continue
      case 56:
        num = num * 10 + 8
        continue
      case 57:
        num = num * 10 + 9
        continue
      case 10:
      case 32:
      case 44:
      case 93:
      case 125:
        parseNumberString.pointer = ptr - 1
        div /= 10
        return (n * div + num) / div
    }

    if (validate) {
      throw new Error('Unexpected token in number')
    }
  }

  return (n * div + num) / div
}

function parseNumberString (buf, ptr, validate) {
  var num = 0
  var sign = 1

  if (buf.charCodeAt(ptr) === 45) {
    sign = -1
    ptr++
  }

  while (ptr < buf.length) {
    switch (buf.charCodeAt(ptr++)) {
      case 46:
        return sign * parseFloatString(num, buf, ptr, validate)
      case 48:
        num = num * 10
        continue
      case 49:
        num = num * 10 + 1
        continue
      case 50:
        num = num * 10 + 2
        continue
      case 51:
        num = num * 10 + 3
        continue
      case 52:
        num = num * 10 + 4
        continue
      case 53:
        num = num * 10 + 5
        continue
      case 54:
        num = num * 10 + 6
        continue
      case 55:
        num = num * 10 + 7
        continue
      case 56:
        num = num * 10 + 8
        continue
      case 57:
        num = num * 10 + 9
        continue
      case 10:
      case 32:
      case 44:
      case 93:
      case 125:
        parseNumberString.pointer = ptr - 1
        return sign * num
    }

    if (validate) {
      throw new Error('Unexpected token in number')
    }
  }

  return sign * num
}

function parseFloatBuffer (n, buf, ptr, validate) {
  var num = 0
  var div = 1
  while (ptr < buf.length) {
    div *= 10
    switch (buf[ptr++]) {
      case 48:
        num = num * 10
        continue
      case 49:
        num = num * 10 + 1
        continue
      case 50:
        num = num * 10 + 2
        continue
      case 51:
        num = num * 10 + 3
        continue
      case 52:
        num = num * 10 + 4
        continue
      case 53:
        num = num * 10 + 5
        continue
      case 54:
        num = num * 10 + 6
        continue
      case 55:
        num = num * 10 + 7
        continue
      case 56:
        num = num * 10 + 8
        continue
      case 57:
        num = num * 10 + 9
        continue
      case 10:
      case 32:
      case 44:
      case 93:
      case 125:
        parseNumberBuffer.pointer = ptr - 1
        div /= 10
        return (n * div + num) / div
    }

    if (validate) {
      throw new Error('Unexpected token in number')
    }
  }

  return (n * div + num) / div
}

function parseNumberBuffer (buf, ptr, validate) {
  var num = 0
  var sign = 1

  if (buf[ptr] === 45) {
    sign = -1
    ptr++
  }

  while (ptr < buf.length) {
    switch (buf[ptr++]) {
      case 46:
        return sign * parseFloatBuffer(num, buf, ptr)
      case 48:
        num = num * 10
        continue
      case 49:
        num = num * 10 + 1
        continue
      case 50:
        num = num * 10 + 2
        continue
      case 51:
        num = num * 10 + 3
        continue
      case 52:
        num = num * 10 + 4
        continue
      case 53:
        num = num * 10 + 5
        continue
      case 54:
        num = num * 10 + 6
        continue
      case 55:
        num = num * 10 + 7
        continue
      case 56:
        num = num * 10 + 8
        continue
      case 57:
        num = num * 10 + 9
        continue
      case 10:
      case 32:
      case 44:
      case 93:
      case 125:
        parseNumberBuffer.pointer = ptr - 1
        return sign * num
    }

    if (validate) {
      throw new Error('Unexpected token in number')
    }
  }

  return sign * num
}
