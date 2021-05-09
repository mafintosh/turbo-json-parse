'use strict'

const t = require('tape')

const tjp = require('../index')

t.test('turbo-json-parse', t => {
  t.test('object', t => {
    t.test('string', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'string' }
        }
      })
      t.deepEqual(parser('{"key1":"value1"}'), {
        key1: 'value1'
      })
      t.deepEqual(parser('{"key1":"\\"val\\"ue1"}'), {
        key1: '"val"ue1'
      })

      t.end()
    })

    t.test('string,string', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'string' }
        }
      })
      t.deepEqual(parser('{"key1":"\\"val\\"ue1","key2":"\\"val\\"ue2"}'), {
        key1: '"val"ue1',
        key2: '"val"ue2'
      })

      t.end()
    })

    t.test('number', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'number' }
        }
      })
      t.deepEqual(parser('{"key1":42}'), {
        key1: 42
      })
      t.deepEqual(parser('{"key1":42.3}'), {
        key1: 42.3
      })

      t.end()
    })

    t.test('number,number', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'number' },
          key2: { type: 'number' }
        }
      })
      t.deepEqual(parser('{"key1":42,"key2":33}'), {
        key1: 42,
        key2: 33
      })
      t.deepEqual(parser('{"key1":42.3,"key2":33.3}'), {
        key1: 42.3,
        key2: 33.3
      })

      t.end()
    })

    t.test('string,number', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'number' }
        }
      })
      t.deepEqual(parser('{"key1":"value1","key2":42}'), {
        key1: 'value1',
        key2: 42
      })

      t.end()
    })

    t.test('number,string', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'number' },
          key2: { type: 'string' }
        }
      })
      t.deepEqual(parser('{"key1":42,"key2":"value2"}'), {
        key1: 42,
        key2: 'value2'
      })

      t.end()
    })

    t.test('boolean', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'boolean' }
        }
      })
      t.deepEqual(parser('{"key1":true}'), {
        key1: true
      })
      t.deepEqual(parser('{"key1":false}'), {
        key1: false
      })

      t.end()
    })

    t.test('boolean,boolean', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          key1: { type: 'boolean' },
          key2: { type: 'boolean' }
        }
      })
      t.deepEqual(parser('{"key1":true,"key2":true}'), {
        key1: true,
        key2: true
      })
      t.deepEqual(parser('{"key1":false,"key2":false}'), {
        key1: false,
        key2: false
      })
      t.deepEqual(parser('{"key1":true,"key2":false}'), {
        key1: true,
        key2: false
      })
      t.deepEqual(parser('{"key1":false,"key2":true}'), {
        key1: false,
        key2: true
      })

      t.end()
    })

    t.test('object', t => {
      t.test('string', t => {
        const parser = tjp({
          type: 'object',
          properties: {
            key1: {
              type: 'object',
              properties: {
                key2: { type: 'string' }
              }
            }
          }
        })
        t.deepEqual(parser('{"key1":{"key2":"value2"}}'), {
          key1: { key2: 'value2' }
        })

        t.end()
      })

      t.test('number', t => {
        const parser = tjp({
          type: 'object',
          properties: {
            key1: {
              type: 'object',
              properties: {
                key2: { type: 'number' }
              }
            }
          }
        })
        t.deepEqual(parser('{"key1":{"key2":42}}'), {
          key1: { key2: 42 }
        })

        t.end()
      })

      t.test()
    })
  })

  t.test('array', t => {
    t.test('string', t => {
      const parser = tjp({
        type: 'array',
        items: {
          type: 'string'
        }
      })
      t.deepEqual(parser('["value1"]'), [
        'value1'
      ])
      t.deepEqual(parser('["value1","value2"]'), [
        'value1',
        'value2'
      ])
      t.deepEqual(parser('[]'), [])

      t.end()
    })

    t.test('number', t => {
      const parser = tjp({
        type: 'array',
        items: {
          type: 'number'
        }
      })
      t.deepEqual(parser('[42]'), [
        42
      ])
      t.deepEqual(parser('[42,33]'), [
        42,
        33
      ])
      t.deepEqual(parser('[42.4,33.3]'), [
        42.4,
        33.3
      ])
      t.deepEqual(parser('[]'), [])

      t.end()
    })

    t.test('boolean', t => {
      const parser = tjp({
        type: 'array',
        items: {
          type: 'boolean'
        }
      })
      t.deepEqual(parser('[true]'), [
        true
      ])
      t.deepEqual(parser('[false]'), [
        false
      ])
      t.deepEqual(parser('[true,false]'), [
        true,
        false
      ])
      t.deepEqual(parser('[]'), [])

      t.end()
    })

    t.test('array', t => {
      t.test('string', t => {
        const parser = tjp({
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        })
        t.deepEqual(parser('[["value1"]]'), [
          [
            'value1'
          ]
        ])
        t.deepEqual(parser('[["value1","value2"]]'), [
          [
            'value1',
            'value2'
          ]
        ])
        t.deepEqual(parser('[[],["value1","value2"]]'), [
          [],
          [
            'value1',
            'value2'
          ]
        ])
        t.deepEqual(parser('[[],["value1","value2"],[]]'), [
          [],
          [
            'value1',
            'value2'
          ],
          []
        ])
        t.deepEqual(parser('[["value1"],["value2"],[]]'), [
          [
            'value1'
          ],
          [
            'value2'
          ],
          []
        ])
        t.deepEqual(parser('[["value1"],["value2"],["value3"]]'), [
          [
            'value1'
          ],
          [
            'value2'
          ],
          [
            'value3'
          ]
        ])
        t.deepEqual(parser('[]'), [])

        t.end()
      })

      t.end()
    })

    t.test('object', t => {
      t.test('string', t => {
        const parser = tjp({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key1: { type: 'string' }
            }
          }
        })
        t.deepEqual(parser('[{"key1":"value1"}]'), [
          { key1: 'value1' }
        ])
        t.deepEqual(parser('[{"key1":"value1"},{"key1":"value2"}]'), [
          { key1: 'value1' },
          { key1: 'value2' }
        ])
        t.deepEqual(parser('[]'), [])

        t.end()
      })
    })

    t.test('object', t => {
      t.test('protected keyword', t => {
        const parser = tjp({
          type: 'object',
          properties: {
            default: { type: 'string' },
            const: { type: 'string' }
          }
        })
        t.deepEqual(parser('{"default":"value1","const":"value2"}'), { default: 'value1', const: 'value2' })

        t.end()
      })
    })

    t.end()
  })

  t.test('object', t => {
    t.test('numeric property name', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          42: { type: 'string' }
        }
      })
      t.deepEqual(parser('{"42":"value1"}'), { 42: 'value1' })

      t.end()
    })
  })

  t.test('object', t => {
    t.test('property name with whitespace', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          // eslint-disable-next-line no-useless-computed-key
          ['hello world']: {
            type: 'object',
            properties: {
              key1: {
                type: 'string'
              }
            }
          }
        }
      })
      const actual = parser('{"hello world":{"key1":"value1"}}')
      // eslint-disable-next-line no-useless-computed-key
      const expected = {['hello world']: {key1: 'value1'}}
      t.deepEqual(actual, expected)

      t.end()
    })

    t.test('property name with whitespace', t => {
      const parser = tjp({
        type: 'object',
        properties: {
          // eslint-disable-next-line no-useless-computed-key
          ['hello world']: { type: 'string' }
        }
      })
      // eslint-disable-next-line no-useless-computed-key
      t.deepEqual(parser('{"hello world":"value1"}'), { ['hello world']: 'value1' })

      t.end()
    })
  })

  t.test('null', t => {
    const parser = tjp({
      type: 'object',
      properties: {
        key1: { type: 'null' }
      }
    })
    t.deepEqual(parser('{"key1":null}'), {
      key1: null
    })
    t.end()
  })

  t.test('pretty print', t => {
    const parser = tjp({
      type: 'object',
      properties: {
        key1: { type: 'null' },
        key2: { type: 'string' }
      }
    }, { prettyPrinted: true })
    t.deepEqual(parser(JSON.stringify({
      key1: null,
      key2: 'test'
    }, null, 2)), {
      key1: null,
      key2: 'test'
    })
    t.end()
  })

  t.end()
})