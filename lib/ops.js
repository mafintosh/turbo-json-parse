exports = module.exports = (opts) =>
  opts.buffer ? exports.buffer : exports.string
exports.buffer = create(true)
exports.string = create(false)

function create (buffer) {
  const name = buffer ? 'b' : 's'

  return {name, ptr, ptrInc, ch, code, eq, ne, stringSlice, indexOf}

  function indexOf (ch, start) {
    return buffer
      ? 'b.indexOf(' + ch.charCodeAt(0) + ', ' + start + ')'
      : 's.indexOf(' + JSON.stringify(ch) + ', ' + start + ')'
  }

  function stringSlice (start, end) {
    return buffer
      ? 'b.utf8Slice(' + start + ', ' + end + ')'
      : 's.slice(' + start + ', ' + end + ')'
  }

  function ptr (offset) {
    return offset ? 'ptr + ' + offset : 'ptr'
  }

  function ptrInc (inc) {
    return inc === 1 ? 'ptr++' : 'ptr += ' + inc
  }

  function ch (ptr) {
    if (buffer) return 'b[' + ptr + ']'
    return 's.charCodeAt(' + ptr + ')'
  }

  function code (val) {
    return val.charCodeAt(0)
  }

  function eq (val, offset) {
    return cmp(val, offset || 0, ' === ', ' && ')
  }

  function ne (val, offset) {
    return cmp(val, offset || 0, ' !== ', ' || ')
  }

  function cmp (val, offset, eq, join) {
    // 16 is arbitrary here but seems to work well
    if (buffer || val.length < 16) {
      const bytes = []

      for (var i = 0; i < val.length; i++) {
        bytes.push(ch(ptr(offset++)) + eq + code(val[i]))
      }

      return bytes.join(join)
    }

    return `s.slice(${ptr(offset)}, ${ptr(
      offset + val.length
    )})${eq}${JSON.stringify(val)}`
  }
}
