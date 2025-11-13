# @hookform/resolvers/elysia-typebox

React Hook Form resolver for Elysia's extended TypeBox schemas, supporting custom error messages and type transforms.

## Installation

```bash
npm install @hookform/resolvers
```

## Features

This resolver extends the standard TypeBox resolver with Elysia-specific features:

- ✅ **Standard TypeBox validation** - All TypeBox schemas work as expected
- ✨ **Transform types** - Automatic type coercion with Elysia's extended types
- 🎯 **Custom error messages** - Define custom validation messages per field
- 🔄 **Type coercion** - Built-in support for `Numeric`, `BooleanString`, `Date`, and more
- 📝 **Error callbacks** - Dynamic error messages based on validation context

## Usage

### Basic Example

```tsx
import { useForm } from 'react-hook-form';
import { elysiaTypeboxResolver } from '@hookform/resolvers/elysia-typebox';
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  name: Type.String({
    minLength: 3,
    maxLength: 30
  }),
  age: Type.Number({
    minimum: 18
  })
});

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: elysiaTypeboxResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="number" {...register('age')} />
      {errors.age && <p>{errors.age.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Custom Error Messages

Define custom error messages directly in your schema:

```tsx
const schema = Type.Object({
  email: Type.String({
    format: 'email',
    error: 'Please enter a valid email address'
  } as any),

  password: Type.String({
    minLength: 8,
    error: 'Password must be at least 8 characters long'
  } as any)
});
```

### Dynamic Error Messages

Use error callbacks for context-aware messages:

```tsx
const schema = Type.Object({
  age: Type.Number({
    minimum: 18,
    error: ({ value }) => `Age ${value} is too young. Must be 18 or older.`
  } as any)
});
```

### Transform Types (Elysia-specific)

The resolver automatically handles Elysia's Transform types, which provide type coercion:

```tsx
// Using standard TypeBox Transform
const schema = Type.Object({
  // String input will be automatically converted to number
  age: Type.Transform(Type.String())
    .Decode((value) => {
      const num = parseFloat(value);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    })
    .Encode((value) => String(value))
});

// With Elysia's extended types (when using Elysia's `t` object)
import { t } from 'elysia';

const elysiaSchema = t.Object({
  age: t.Numeric(),           // String → Number
  active: t.BooleanString(),  // "true"/"false" → Boolean
  data: t.ObjectString(),     // JSON string → Object
  createdAt: t.Date()         // Various date formats → Date
});
```

### Nested Objects with Custom Errors

```tsx
const schema = Type.Object({
  user: Type.Object({
    profile: Type.Object({
      age: Type.Number({
        minimum: 0,
        error: 'Age must be positive'
      } as any)
    })
  })
});

// Errors will be available at: errors['user.profile.age']
```

### With TypeCompiler

For improved performance with compiled schemas:

```tsx
import { TypeCompiler } from '@sinclair/typebox/compiler';

const schema = Type.Object({
  name: Type.String()
});

const compiledSchema = TypeCompiler.Compile(schema);

const { register } = useForm({
  resolver: elysiaTypeboxResolver(compiledSchema)
});
```

## Differences from Standard TypeBox Resolver

| Feature | Standard TypeBox | Elysia TypeBox |
|---------|-----------------|----------------|
| Basic validation | ✅ | ✅ |
| Custom error messages | ❌ | ✅ |
| Error callbacks | ❌ | ✅ |
| Transform type decoding | ⚠️ Manual | ✅ Automatic |
| Elysia extended types | ❌ | ✅ |

## API

### `elysiaTypeboxResolver(schema, options?)`

#### Parameters

- `schema` - An Elysia/TypeBox schema or compiled TypeCheck
- `options` - Optional resolver configuration (currently unused, reserved for future use)

#### Returns

A resolver function compatible with React Hook Form's `useForm` hook.

## Type Safety

The resolver maintains full TypeScript support:

```tsx
import { Type } from '@sinclair/typebox';
import { useForm } from 'react-hook-form';

const schema = Type.Object({
  name: Type.String(),
  age: Type.Number()
});

// TypeScript infers the form data type automatically
const form = useForm({
  resolver: elysiaTypeboxResolver(schema)
});

// form.watch('name') is typed as string
// form.watch('age') is typed as number
```

## Error Handling

Validation errors are automatically formatted for React Hook Form:

```tsx
{
  "fieldName": {
    "type": "string",        // Validation type that failed
    "message": "Error text"  // Custom or default error message
  }
}
```

With `criteriaMode: 'all'`:

```tsx
{
  "fieldName": {
    "type": "string",
    "message": "Error text",
    "types": {
      "minLength": "Too short",
      "pattern": "Invalid format"
    }
  }
}
```

## License

MIT