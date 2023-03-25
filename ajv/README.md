# AJV Resolver

## API

```ts
// Note that T will be inferred based on given schema
type Options<T> = {
  mode?: 'async' | 'sync',
  transform?: (data: T) => T,
}

ajvResolver(schema: object, schemaOptions?: object, resolverOptions?: Options)
```

|                              | type                 | Required | Description                                      |
| ---------------------------- | -------------------- | :------: | ------------------------------------------------ |
| schema                       | `object`             |    ✓     | validation schema                                |
| schemaOptions                | `object`             |          | [ajv options](https://ajv.js.org/options.html)   |
| schemaOptions.allErrors      | `boolean`            |          | true                                             |
| schemaOptions.validateSchema | `boolean`            |          | true                                             |
| resolverOptions              | `Options`            |          | resolver                                         |
| resolverOptions.mode         | `async     \|  sync` |          | async                                            |
| resolverOptions.transform    | `Function`           |          | function to transform data before validation (1) |

(1) Make sure to not mutate given "values" object

## Common patterns

### Optional fields with validation (See #471)

The combination of the following two behaviors results in a problem when we have optional fields with validation like string format:

1. `react-hook-form` [encourages you to set defaultValues for the entire form](https://react-hook-form.com/api/useform/#defaultValues) and avoid `undefined` values
2. `ajv` validates all present fields

As our form has all fields present by design, `ajv` will validate them. For example:

```ts
// schema
{
  type: 'object',
  required: ['username'],
  properties: {
    username: {
      type: 'string',
      minLength: 3,
    },
    email: {
      type: 'string',
      pattern: '^[0-9a-zA-Z\.]+@[0-9a-zA-Z]+\.com$'
    }
  }
}

// form values
{
  username: 'amazing user',
  email: '',
}

// Even though "email" is optional, as it's present, ajv validation will fail
```

In order to address this problem, we can define a `transform` function that will be executed before `ajv` validate the data and before submitting it:

```tsx
function transform(values) {
  // make sure to not mutate given "values" object
  // clone and remove empty fields for example
  return modifiedValues;
}

const { handleSubmit }= useForm({
  resolver: ajvResolver(schema, null, { transform })
});

<form onSubmit={handleSubmit((data) => console.log(transform(data))}>
  ...
</form>
```
