<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Performant, flexible and extensible forms with easy to use validation.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form-resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form-resolvers)
[![npm](https://img.shields.io/npm/dt/react-hook-form-resolvers.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form-resolvers)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form-resolvers?style=for-the-badge)](https://bundlephobia.com/result?p=react-hook-form-resolvers)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form-resolvers)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

## Goal

We are moving away from native support for Yup validation and begin to support others schema validation after React Hook Form v6.

## Install

    $ npm install react-hook-form-resolvers
    
## API    

`resolver(schema, config)`

|  | type | Required | Description|
|--|--|--|--|
| resolver | `function` | | validation resolver function based on Yup/Joi/Superstruct |
| schema | `object` | ✓| validation schema |
| config | `object` | | validation schema configuration object |


## Quickstart

### [Yup](https://github.com/jquense/yup) 

![npm](https://img.shields.io/bundlephobia/minzip/yup?style=for-the-badge)](https://bundlephobia.com/result?p=yup)

Dead simple Object schema validation

```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from 'react-hook-form-resolvers';
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
      <label>Test</label>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />
    
      <input type="submit" />
    </form>
  );
};
```

### [Superstruct](https://github.com/ianstormtaylor/superstruct)

[![npm](https://img.shields.io/bundlephobia/minzip/superstruct?style=for-the-badge)](https://bundlephobia.com/result?p=superstruct)

A simple and composable way to validate data in JavaScript (or TypeScript).
  
```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { superstructResolver } from 'react-hook-form-resolvers';
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
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <label>Test</label>
      <input name="name" ref={register} />
      <input name="age" type="number" ref={register} />
    
      <input type="submit" />
    </form>
  );
};
```

### [Joi](https://github.com/hapijs/joi)

[![npm](https://img.shields.io/bundlephobia/minzip/@hapi/joi?style=for-the-badge)](https://bundlephobia.com/result?p=@hapi/joi)

The most powerful data validation library for JS
  
```typescript jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from 'react-hook-form-resolvers';
import Joi from "@hapi/joi";

const schema = Joi.object({
  username: Joi.string().required()
});

const App = () => {
  const { register, handleSubmit } = useForm({
    resolver: joiResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <label>Test</label>
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
