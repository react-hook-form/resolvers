<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
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

We are moving away from native support for Yup validation and begin to support others schema validation after React Hook Form v6.

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
import { yupResolver } from '@hookform/resolvers';
import yup as * from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required(),
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />

      <input type="submit" />
    </form>
  );
};
```

### [Superstruct](https://github.com/ianstormtaylor/superstruct)

A simple and composable way to validate data in JavaScript (or TypeScript).

[![npm](https://img.shields.io/bundlephobia/minzip/superstruct?style=for-the-badge)](https://bundlephobia.com/result?p=superstruct)

```typescript jsx
import React from "react";
import { useForm } from "react-hook-form";
import { superstructResolver } from "@hookform/resolvers";
import { struct } from "superstruct";

const schema = struct({
  name: "string",
  age: "number",
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

### [Joi](https://github.com/hapijs/joi)

The most powerful data validation library for JS.

[![npm](https://img.shields.io/bundlephobia/minzip/@hapi/joi?style=for-the-badge)](https://bundlephobia.com/result?p=@hapi/joi)

```typescript jsx
import React from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers";
import Joi from "@hapi/joi";

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
