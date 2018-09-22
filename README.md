# turbo-json-parse

Turbocharged JSON.parse for type stable JSON data.

```
npm install turbo-json-parse
```

Experiment, but seems to work quite well already
and is really fast assuming your JSON is type stable.

## Usage

``` js
const compile = require('turbo-json-parse')

// Pass in a JSON schema
// Note that only a subset of the schema is supported at the moment
// including all of the type information, but excluding stuff like anyOf
// PR welcome to expand to support :)

const parse = compile({
  type: 'object',
  properties: {
    hello: {type: 'string'},
    num: {type: 'number'},
    flag: {type: 'boolean'},
    flags: {type: 'array', items: {type: 'boolean'}},
    nested: {
      type: 'object',
      properties: {
        more: {type: 'string'}
      }
    }
  }
})

const ex = JSON.stringify({
  hello: 'world'
})

// will return {hello: 'world'}
console.log(parse(ex))
```

## API

#### `const parse = compile(schema, [options])`

Make a new turbo charged JSON parser based on the type schema provided.
The type schema should have a similar syntax to the above example.

The parser is only able to parse objects that look like the schema,
in terms of the types provided and the order of keys.

Options include:

```js
{
  buffer: false, // set to true if you are parsing from buffers instead of strings
  required: false, // set to true if all properties are required
  ordered: false, // set to true if your properties have the same order always
  validate: true, // set to false to disable extra type validation
  fullMatch: true, // set to false to do fastest match based on the schema (unsafe!) 
  unsafe: false, // set to true to enable all unsafe optimizations
  unescapeStrings: true, // set to false if you don't need to unescape \ chars
  defaults: true // set to false to disable setting of default properties
  prettyPrinted: false // set to true to parse json formatted with JSON.stringify(x, null, 2)
}
```

If you trust your input setting `unsafe` to `true` will gain you extra performance, at the cost of some important validation logic.

If you have the underlying buffer, set `buffer` to true and pass the buffer instead of the string to parse

```js
const parse = compile(..., {buffer: true})
const data = parse(buffer) // parse buffer instead of string
```

This will speed up the parsing by 2-3x as well.

#### `parse = compile.from(obj, [options])`

Generate a parser based on the type information from an existing object.

## Performance

If your JSON data follows the heuristics described above this parser can be very fast.

On the included benchmark this is 5x faster than JSON parse on my machine, YMMV.

## How does this work?

This works by taking the schema of the data and generating a specific JSON parser for exactly that schema.
You can actually view the source code of the generated parser by doing `parse.toString()` after compiling it.

This is much faster than parsing for a generic object, as the schema information helps the parser know what
it is looking for, which is why this is faster to JSON.parse.

## Related

See [jitson](https://github.com/mafintosh/jitson) for a Just-In-Time JSON.parse compiler
that uses this module when the incoming JSON is stable and falls back to JSON.parse when not.

## License

MIT
