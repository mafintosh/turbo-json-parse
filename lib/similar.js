module.exports = similar

function similar (a, b) {
  const len = Math.min(a.length, b.length)

  for (var i = 0; i < len; i++) {
    if (a.charCodeAt(i) === b.charCodeAt(i)) continue
    return i
  }

  return len
}
