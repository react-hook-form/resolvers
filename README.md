<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/docs/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Performant, flexible and extensible forms with easy to use validation.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@hookform/resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/resolvers)
[![npm](https://img.shields.io/npm/dt/@hookform/resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/resolvers)
[![npm](https://img.shields.io/bundlephobia/minzip/@hookform/resolvers?style=for-the-badge)](https://bundlephobia.com/result?p=@hookform/resolvers)

</div>

## Goal

We are moving away from native support for Yup validation. We are now supporting other schema validation after React Hook Form v6.

## Install

    $ npm install @hookform/resolvers

## API

`resolver(schema: object, config?: object)`

|        | type     | Required | Description                            |
| ------ | -------- | -------- | -------------------------------------- |
| schema | `object` | ✓        | validation schema                      |
| config | `object` |          | validation schema configuration object |

## Quickstart

### [Yup](https://github.com/jquense/yup)

Dead simple Object schema validation.

[![npm](https://img.shields.io/bundlephobia/minzip/yup?style=for-the-badge)](https://bundlephobia.com/result?p=yup)

```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />
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
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().nonempty({ message: 'Required' }),
  age: z.number().min(10),
});

const App = () => {
  const { register, handleSubmit, errors } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input name="name" ref={register} />
      {errors.name?.message && <p>{errors.name?.message}</p>}
      <input name="age" type="number" ref={register({ valueAsNumber: true })} />
      {errors.age?.message && <p>{errors.age?.message}</p>}
      <input type="submit" />
    </form>
  );
};

export default App;
```

### [Superstruct](https://github.com/ianstormtaylor/superstruct)

A simple and composable way to validate data in JavaScript (or TypeScript).

[![npm](https://img.shields.io/bundlephobia/minzip/superstruct?style=for-the-badge)](https://bundlephobia.com/result?p=superstruct)

```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { superstructResolver } from '@hookform/resolvers/superstruct';
import { struct } from 'superstruct';

const schema = struct({
  name: 'string',
  age: 'number',
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: superstructResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />
      <input type="submit" />
    </form>
  );
};
```

### [Joi](https://github.com/sideway/joi)

The most powerful data validation library for JS.

[![npm](https://img.shields.io/bundlephobia/minzip/joi?style=for-the-badge)](https://bundlephobia.com/result?p=joi)

```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

const schema = Joi.object({
  username: Joi.string().required(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: joiResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />
      <input type="submit" />
    </form>
  );
};
```

### [Vest](https://github.com/ealush/vest)

Vest 🦺 Declarative Validation Testing.

[![npm](https://img.shields.io/bundlephobia/minzip/vest?style=for-the-badge)](https://bundlephobia.com/result?p=vest)

```typescript jsx
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { vestResolver } from '@hookform/resolvers/vest';
import vest, { test, enforce } from 'vest';

const validationSuite = vest.create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  test('username', 'Must be longer than 3 chars', () => {
    enforce(data.username).longerThan(3);
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', 'Password must be at least 5 chars', () => {
    enforce(data.password).longerThanOrEquals(5);
  });

  test('password', 'Password must contain a digit', () => {
    enforce(data.password).matches(/[0-9]/);
  });

  test('password', 'Password must contain a symbol', () => {
    enforce(data.password).matches(/[^A-Za-z0-9]/);
  });
});

const App = () => {
  const { register, handleSubmit, errors } = useForm({
    resolver: vestResolver(validationSuite),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input type="text" name="username" ref={register} />
      <input type="text" name="password" ref={register} />
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

## Organizations

Thanks goes to these wonderful organizations! [[Contribute](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Contributors

Thanks goes to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
