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

// pass in a type schema
const parse = compile({
  hello: 'string',
  num: 'number',
  flag: 'boolean',
  flags: ['boolean'], // array of booleans
  nested: {
    more: 'string'
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
  optional: true, // set to false if all properties are required
  buffer: false, // set to true if have the underlying buffer of the string you wanna parse
  validate: true, // set to false to disable extra type validation
  unsafe: false, // set to true to enable unsafe optimizations
  unescapeStrings: true // set to false if you don't need to unescape \ chars
}
```

If you trust your input setting `unsafe` to `true` will gain you extra performance, at the cost of some important validation logic.

If you have the underlying buffer, set `buffer` to true and then pass the buffer as the 2nd argument to parse`

```js
const data = parse(string, theBufferYouToStringed)
```

This will speed up the parsing by 2-3x as well.

#### `typeSchema = compile.schema(obj)`

Generate a type schema from an existing object.

## Performance

If your JSON data follows the heuristics described above this parser can be very fast.

On the included benchmark this is 5x faster than JSON parse on my machine, YMMV.

## License

MIT
