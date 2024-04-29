<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/docs/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" />
        </a>
    </p>
</div>

<p align="center">Performant, flexible and extensible forms with easy to use validation.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@hookform/resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/resolvers)
[![npm](https://img.shields.io/npm/dt/@hookform/resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/resolvers)
[![npm](https://img.shields.io/bundlephobia/minzip/@hookform/resolvers?style=for-the-badge)](https://bundlephobia.com/result?p=@hookform/resolvers)

</div>

## Install

    npm install @hookform/resolvers

## Links

- [React-hook-form validation resolver documentation ](https://react-hook-form.com/api/useform/#resolver)

### Supported resolvers

- [Install](#install)
- [Links](#links)
  - [Supported resolvers](#supported-resolvers)
- [API](#api)
- [Quickstart](#quickstart)
  - [Yup](#yup)
  - [Zod](#zod)
  - [Superstruct](#superstruct)
  - [Joi](#joi)
  - [Vest](#vest)
  - [Class Validator](#class-validator)
  - [io-ts](#io-ts)
  - [Nope](#nope)
  - [computed-types](#computed-types)
  - [typanion](#typanion)
  - [Ajv](#ajv)
  - [TypeBox](#typebox)
    - [With `ValueCheck`](#with-valuecheck)
    - [With `TypeCompiler`](#with-typecompiler)
  - [ArkType](#arktype)
  - [Valibot](#valibot)
- [Backers](#backers)
  - [Sponsors](#sponsors)
- [Contributors](#contributors)

## API

```
type Options = {
  mode: 'async' | 'sync',
  raw?: boolean
}

resolver(schema: object, schemaOptions?: object, resolverOptions: Options)
```

|                 | type     | Required | Description                                   |
| --------------- | -------- | -------- | --------------------------------------------- |
| schema          | `object` | ✓        | validation schema                             |
| schemaOptions   | `object` |          | validation library schema options             |
| resolverOptions | `object` |          | resolver options, `async` is the default mode |

## Quickstart

### [Yup](https://github.com/jquense/yup)

Dead simple Object schema validation.

[![npm](https://img.shields.io/bundlephobia/minzip/yup?style=for-the-badge)](https://bundlephobia.com/result?p=yup)

```typescript jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup
  .object()
  .shape({
    name: yup.string().required(),
    age: yup.number().required(),
  })
  .required();

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      <input type="number" {...register('age')} />
      <input type="submit" />
    </form>
  );
};
```

### [Zod](https://github.com/vriad/zod)

TypeScript-first schema validation with static type inference

[![npm](https://img.shields.io/bundlephobia/minzip/zod?style=for-the-badge)](https://bundlephobia.com/result?p=zod)

> ⚠️ Example below uses the `valueAsNumber`, which requires `react-hook-form` v6.12.0 (released Nov 28, 2020) or later.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  age: z.number().min(10),
});

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      {errors.name?.message && <p>{errors.name?.message}</p>}
      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age?.message && <p>{errors.age?.message}</p>}
      <input type="submit" />
    </form>
  );
};
```

### [Superstruct](https://github.com/ianstormtaylor/superstruct)

A simple and composable way to validate data in JavaScript (or TypeScript).

[![npm](https://img.shields.io/bundlephobia/minzip/superstruct?style=for-the-badge)](https://bundlephobia.com/result?p=superstruct)

```typescript jsx
import { useForm } from 'react-hook-form';
import { superstructResolver } from '@hookform/resolvers/superstruct';
import { object, string, number } from 'superstruct';

const schema = object({
  name: string(),
  age: number(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: superstructResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      <input type="number" {...register('age', { valueAsNumber: true })} />
      <input type="submit" />
    </form>
  );
};
```

### [Joi](https://github.com/sideway/joi)

The most powerful data validation library for JS.

[![npm](https://img.shields.io/bundlephobia/minzip/joi?style=for-the-badge)](https://bundlephobia.com/result?p=joi)

```typescript jsx
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: joiResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      <input type="number" {...register('age')} />
      <input type="submit" />
    </form>
  );
};
```

### [Vest](https://github.com/ealush/vest)

Vest 🦺 Declarative Validation Testing.

[![npm](https://img.shields.io/bundlephobia/minzip/vest?style=for-the-badge)](https://bundlephobia.com/result?p=vest)

```typescript jsx
import { useForm } from 'react-hook-form';
import { vestResolver } from '@hookform/resolvers/vest';
import { create, test, enforce } from 'vest';

const validationSuite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
});

const App = () => {
  const { register, handleSubmit, errors } = useForm({
    resolver: vestResolver(validationSuite),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('username')} />
      <input type="password" {...register('password')} />
      <input type="submit" />
    </form>
  );
};
```

### [Class Validator](https://github.com/typestack/class-validator)

Decorator-based property validation for classes.

[![npm](https://img.shields.io/bundlephobia/minzip/class-validator?style=for-the-badge)](https://bundlephobia.com/result?p=class-validator)

> ⚠️ Remember to add these options to your `tsconfig.json`!

```
"strictPropertyInitialization": false,
"experimentalDecorators": true
```

```tsx
import { useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Length, Min, IsEmail } from 'class-validator';

class User {
  @Length(2, 30)
  username: string;

  @IsEmail()
  email: string;
}

const resolver = classValidatorResolver(User);

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({ resolver });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input type="text" {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      <input type="text" {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="submit" value="Submit" />
    </form>
  );
};
```

### [io-ts](https://github.com/gcanti/io-ts)

Validate your data with powerful decoders.

[![npm](https://img.shields.io/bundlephobia/minzip/io-ts?style=for-the-badge)](https://bundlephobia.com/result?p=io-ts)

```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { ioTsResolver } from '@hookform/resolvers/io-ts';
import t from 'io-ts';
// you don't have to use io-ts-types, but it's very useful
import tt from 'io-ts-types';

const schema = t.type({
  username: t.string,
  age: tt.NumberFromString,
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: ioTsResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('username')} />
      <input type="number" {...register('age')} />
      <input type="submit" />
    </form>
  );
};

export default App;
```

### [Nope](https://github.com/bvego/nope-validator)

A small, simple, and fast JS validator

[![npm](https://img.shields.io/bundlephobia/minzip/nope-validator?style=for-the-badge)](https://bundlephobia.com/result?p=nope-validator)

```typescript jsx
import { useForm } from 'react-hook-form';
import { nopeResolver } from '@hookform/resolvers/nope';
import Nope from 'nope-validator';

const schema = Nope.object().shape({
  name: Nope.string().required(),
  age: Nope.number().required(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: nopeResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      <input type="number" {...register('age')} />
      <input type="submit" />
    </form>
  );
};
```

### [computed-types](https://github.com/neuledge/computed-types)

TypeScript-first schema validation with static type inference

[![npm](https://img.shields.io/bundlephobia/minzip/computed-types?style=for-the-badge)](https://bundlephobia.com/result?p=computed-types)

```tsx
import { useForm } from 'react-hook-form';
import { computedTypesResolver } from '@hookform/resolvers/computed-types';
import Schema, { number, string } from 'computed-types';

const schema = Schema({
  username: string.min(1).error('username field is required'),
  age: number,
});

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: computedTypesResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      {errors.name?.message && <p>{errors.name?.message}</p>}
      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age?.message && <p>{errors.age?.message}</p>}
      <input type="submit" />
    </form>
  );
};
```

### [typanion](https://github.com/arcanis/typanion)

Static and runtime type assertion library with no dependencies

[![npm](https://img.shields.io/bundlephobia/minzip/typanion?style=for-the-badge)](https://bundlephobia.com/result?p=typanion)

```tsx
import { useForm } from 'react-hook-form';
import { typanionResolver } from '@hookform/resolvers/typanion';
import * as t from 'typanion';

const isUser = t.isObject({
  username: t.applyCascade(t.isString(), [t.hasMinLength(1)]),
  age: t.applyCascade(t.isNumber(), [
    t.isInteger(),
    t.isInInclusiveRange(1, 100),
  ]),
});

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: typanionResolver(isUser),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      {errors.name?.message && <p>{errors.name?.message}</p>}
      <input type="number" {...register('age')} />
      {errors.age?.message && <p>{errors.age?.message}</p>}
      <input type="submit" />
    </form>
  );
};
```

### [Ajv](https://github.com/ajv-validator/ajv)

The fastest JSON validator for Node.js and browser

[![npm](https://img.shields.io/bundlephobia/minzip/ajv?style=for-the-badge)](https://bundlephobia.com/result?p=ajv)

```tsx
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'username field is required' },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'password field is required' },
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
};

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: ajvResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      <input {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">submit</button>
    </form>
  );
};
```

### [TypeBox](https://github.com/sinclairzx81/typebox)

JSON Schema Type Builder with Static Type Resolution for TypeScript

[![npm](https://img.shields.io/bundlephobia/minzip/@sinclair/typebox?style=for-the-badge)](https://bundlephobia.com/result?p=@sinclair/typebox)

#### With `ValueCheck`

```typescript jsx
import { useForm } from 'react-hook-form';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  username: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 }),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: typeboxResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('username')} />
      <input type="password" {...register('password')} />
      <input type="submit" />
    </form>
  );
};
```

#### With `TypeCompiler`

A high-performance JIT of `TypeBox`, [read more](https://github.com/sinclairzx81/typebox#typecompiler)

```typescript jsx
import { useForm } from 'react-hook-form';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const schema = Type.Object({
  username: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 }),
});

const typecheck = TypeCompiler.Compile(schema);

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: typeboxResolver(typecheck),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('username')} />
      <input type="password" {...register('password')} />
      <input type="submit" />
    </form>
  );
};
```

### [ArkType](https://github.com/arktypeio/arktype)

TypeScript's 1:1 validator, optimized from editor to runtime

[![npm](https://img.shields.io/bundlephobia/minzip/arktype?style=for-the-badge)](https://bundlephobia.com/result?p=arktype)

```typescript jsx
import { useForm } from 'react-hook-form';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';

const schema = type({
  username: 'string>1',
  password: 'string>1',
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: arktypeResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('username')} />
      <input type="password" {...register('password')} />
      <input type="submit" />
    </form>
  );
};
```

### [Valibot](https://github.com/fabian-hiller/valibot)

The modular and type safe schema library for validating structural data

[![npm](https://img.shields.io/bundlephobia/minzip/valibot?style=for-the-badge)](https://bundlephobia.com/result?p=valibot)

```typescript jsx
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, minLength, endsWith } from 'valibot';

const schema = object({
  username: string('username is required', [
    minLength(3, 'Needs to be at least 3 characters'),
    endsWith('cool', 'Needs to end with `cool`'),
  ]),
  password: string('password is required'),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: valibotResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('username')} />
      <input type="password" {...register('password')} />
      <input type="submit" />
    </form>
  );
};
```

## Backers

Thanks goes to all our backers! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

### Sponsors

Thanks go to these kind and lovely sponsors!

<a target="_blank" href='https://wantedlyinc.com'>
    <img width="94" src="https://images.opencollective.com/wantedly/d94e44e/logo/256.png" />
</a>
<a target="_blank" href='https://toss.im'>
    <img width="94" src="https://images.opencollective.com/toss/3ed69b3/logo/256.png" />
</a>
<a target="_blank" href="https://graphcms.com">
    <img width="94" src="https://avatars.githubusercontent.com/u/31031438" />
</a>
<a target="_blank" href="https://www.beekai.com/">
    <img width="94" src="https://www.beekai.com/marketing/logo/logo.svg" />
</a>
<a target="_blank" href="https://kanamekey.com">
    <img width="94" src="https://images.opencollective.com/kaname/d15fd98/logo/256.png" />
</a>
<a target="_blank" href="https://formcarry.com/">
    <img width="94" src="https://images.opencollective.com/formcarry/a40a4ea/logo/256.png" />
</a>

## Contributors

Thanks goes to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
