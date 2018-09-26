'use strict'

const t = require('tape')

const tjp = require('../index')

t.test('should parse anyOf string and null', t => {
  t.plan(2)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'null'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":"string"}'), {
    key1: 'string'
  })
  t.deepEqual(parser('{"key1":null}'), {
    key1: null
  })
})

t.test('should parse nested anyOf string and null', t => {
  t.plan(3)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'object',
            properties: {
              key2: {
                anyOf: [
                  {
                    type: 'string'
                  },
                  {
                    type: 'null'
                  }
                ]
              }
            }
          },
          {
            type: 'boolean'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":{"key2":"string"}}'), {
    key1: {
      key2: 'string'
    }
  })
  t.deepEqual(parser('{"key1":{"key2":null}}'), {
    key1: {
      key2: null
    }
  })
  t.deepEqual(parser('{"key1":false}'), {
    key1: false
  })
})

t.test('should parse anyOf string, boolean or null', t => {
  t.plan(3)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'null'
          },
          {
            type: 'boolean'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":"string"}'), {
    key1: 'string'
  })
  t.deepEqual(parser('{"key1":null}'), {
    key1: null
  })
  t.deepEqual(parser('{"key1":true}'), {
    key1: true
  })
})

t.test('should parse anyOf array and null', t => {
  t.plan(4)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          {
            type: 'null'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":["string"]}'), {
    key1: ['string']
  })
  t.deepEqual(parser('{"key1":["bird","cat"]}'), {
    key1: ['bird', 'cat']
  })
  t.deepEqual(parser('{"key1":[]}'), {
    key1: []
  })
  t.deepEqual(parser('{"key1":null}'), {
    key1: null
  })
})

t.test('should parse anyOf boolean and null', t => {
  t.plan(3)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'boolean'
          },
          {
            type: 'null'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":true}'), {
    key1: true
  })
  t.deepEqual(parser('{"key1":false}'), {
    key1: false
  })
  t.deepEqual(parser('{"key1":null}'), {
    key1: null
  })
})

t.test('should parse anyOf number and null', t => {
  t.plan(12)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'number'
          },
          {
            type: 'null'
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":0}'), {
    key1: 0
  })
  t.deepEqual(parser('{"key1":1}'), {
    key1: 1
  })
  t.deepEqual(parser('{"key1":2}'), {
    key1: 2
  })
  t.deepEqual(parser('{"key1":3}'), {
    key1: 3
  })
  t.deepEqual(parser('{"key1":4}'), {
    key1: 4
  })
  t.deepEqual(parser('{"key1":5}'), {
    key1: 5
  })
  t.deepEqual(parser('{"key1":6}'), {
    key1: 6
  })
  t.deepEqual(parser('{"key1":7}'), {
    key1: 7
  })
  t.deepEqual(parser('{"key1":8}'), {
    key1: 8
  })
  t.deepEqual(parser('{"key1":9}'), {
    key1: 9
  })
  t.deepEqual(parser('{"key1":1.1}'), {
    key1: 1.1
  })
  t.deepEqual(parser('{"key1":null}'), {
    key1: null
  })
})

t.test('should parse anyOf string and object', t => {
  t.plan(2)

  const parser = tjp({
    type: 'object',
    properties: {
      key1: {
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'object',
            properties: {
              key2: {
                type: 'string'
              }
            }
          }
        ]
      }
    }
  })
  t.deepEqual(parser('{"key1":"string"}'), {
    key1: 'string'
  })
  t.deepEqual(parser('{"key1":{"key2":"blue"}}'), {
    key1: {
      key2: 'blue'
    }
  })
})

t.test('should parse anyOf string and null', t => {
  t.plan(2)

  const parser = tjp({
    type: 'object',
    properties: {
      key0: {
        type: 'boolean'
      },
      key1: {
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'null'
          }
        ]
      },
      key2: {
        type: 'number'
      }
    }
  })
  t.deepEqual(parser('{"key0":true,"key1":"string","key2":42}'), {
    key0: true,
    key1: 'string',
    key2: 42
  })
  t.deepEqual(parser('{"key0":true,"key1":null,"key2":42}'), {
    key0: true,
    key1: null,
    key2: 42
  })
})
