'use strict'

const t = require('tap')
const tjp = require('./index')

t.test('turbo json parse', t => {
  t.test('object - string property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'string' } } })
    t.strictSame(p('{"key1":"value1"}'), { key1: 'value1' })
    t.end()
  })

  t.test('object - two string property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'string' }, key2: { type: 'string' } } })
    t.strictSame(p('{"key1":"value1","key2":"value2"}'), { key1: 'value1', key2: 'value2' })
    t.end()
  })

  t.test('object - number property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'number' } } })
    t.strictSame(p('{"key1":554}'), { key1: 554 })
    t.end()
  })

  t.test('object - boolean property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'boolean' } } })
    t.strictSame(p('{"key1":true}'), { key1: true })
    t.strictSame(p('{"key1":false}'), { key1: false })
    t.end()
  })

  t.test('object - array - string property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'array', items: { type: 'string' } } } })
    t.strictSame(p('{"key1":["qq"]}'), { key1: ['qq'] })
    t.strictSame(p('{"key1":["qq","rr"]}'), { key1: ['qq', 'rr'] })
    t.strictSame(p('{"key1":["qq","rr","rrrrr"]}'), { key1: ['qq', 'rr', 'rrrrr'] })
    t.end()
  })

  t.test('object - array - number property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'array', items: { type: 'number' } } } })
    t.strictSame(p('{"key1":[55]}'), { key1: [55] })
    t.strictSame(p('{"key1":[55,66]}'), { key1: [55, 66] })
    t.end()
  })

  t.test('object - array - boolean property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'array', items: { type: 'boolean' } } } })
    t.strictSame(p('{"key1":[true]}'), { key1: [true] })
    t.strictSame(p('{"key1":[false]}'), { key1: [false] })
    t.strictSame(p('{"key1":[true,false]}'), { key1: [true, false] })
    t.strictSame(p('{"key1":[false,true]}'), { key1: [false, true] })
    t.end()
  })

  t.test('object - object - string property', t => {
    const p = tjp({ type: 'object', properties: { key1: { type: 'object', properties: { key2: { type: 'string' } } } } })
    t.strictSame(p('{"key1":{"key2":"foo"}}'), { key1: { key2: 'foo' } })
    t.end()
  })

  t.end()
})
