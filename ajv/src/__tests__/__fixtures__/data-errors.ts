import { JSONSchemaType } from 'ajv';
import { Field, InternalFieldName } from 'react-hook-form';

interface DataA {
  username: string;
  password: string;
}

export const schemaA: JSONSchemaType<DataA> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      errorMessage: {
        minLength: 'username should be at least three characters long',
      },
    },
    password: {
      type: 'string',
      pattern: '.*[A-Z].*',
      minLength: 8,
      errorMessage: {
        pattern: 'One uppercase character',
        minLength: 'passwords should be at least eight characters long',
      },
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
  errorMessage: {
    required: {
      username: 'username field is required',
      password: 'password field is required',
    },
  },
};

export const validDataA: DataA = {
  username: 'kt666',
  password: 'validPassword',
};

export const invalidDataA = {
  username: 'kt',
  password: 'invalid',
};

export const undefinedDataA = {
  username: undefined,
  password: undefined,
};

export const fieldsA: Record<InternalFieldName, Field['_f']> = {
  username: {
    ref: { name: 'username' },
    name: 'username',
  },
  password: {
    ref: { name: 'password' },
    name: 'password',
  },
  email: {
    ref: { name: 'email' },
    name: 'email',
  },
  birthday: {
    ref: { name: 'birthday' },
    name: 'birthday',
  },
};

// examples from [ajv-errors](https://github.com/ajv-validator/ajv-errors)

interface DataB {
  foo: number;
}

export const schemaB: JSONSchemaType<DataB> = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: { type: 'integer' },
  },
  additionalProperties: false,
  errorMessage: 'should be an object with an integer property foo only',
};

export const validDataB: DataB = { foo: 666 };
export const invalidDataB = { foo: 'kt', bar: 6 };
export const undefinedDataB = { foo: undefined };

interface DataC {
  foo: number;
}

export const schemaC: JSONSchemaType<DataC> = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: { type: 'integer' },
  },
  additionalProperties: false,
  errorMessage: {
    type: 'should be an object',
    required: 'should have property foo',
    additionalProperties: 'should not have properties other than foo',
  },
};

export const validDataC: DataC = { foo: 666 };
export const invalidDataC = { foo: 'kt', bar: 6 };
export const undefinedDataC = { foo: undefined };
export const invalidTypeDataC = 'something';

interface DataD {
  foo: number;
  bar: string;
}

export const schemaD: JSONSchemaType<DataD> = {
  type: 'object',
  required: ['foo', 'bar'],
  properties: {
    foo: { type: 'integer' },
    bar: { type: 'string' },
  },
  errorMessage: {
    type: 'should be an object', // will not replace internal "type" error for the property "foo"
    required: {
      foo: 'should have an integer property "foo"',
      bar: 'should have a string property "bar"',
    },
  },
};

export const validDataD: DataD = { foo: 666, bar: 'kt' };
export const invalidDataD = { foo: 'kt', bar: 6 };
export const undefinedDataD = { foo: undefined, bar: undefined };
export const invalidTypeDataD = 'something';

interface DataE {
  foo: number;
  bar: string;
}

export const schemaE: JSONSchemaType<DataE> = {
  type: 'object',
  required: ['foo', 'bar'],
  allOf: [
    {
      properties: {
        foo: { type: 'integer', minimum: 2 },
        bar: { type: 'string', minLength: 2 },
      },
      additionalProperties: false,
    },
  ],
  errorMessage: {
    properties: {
      foo: 'data.foo should be integer >= 2',
      bar: 'data.bar should be string with length >= 2',
    },
  },
};

export const validDataE: DataE = { foo: 666, bar: 'kt' };
export const invalidDataE = { foo: 1, bar: 'k' };
export const undefinedDataE = { foo: undefined, bar: undefined };

interface DataF {
  foo: number;
  bar: string;
}

export const schemaF: JSONSchemaType<DataF> = {
  type: 'object',
  required: ['foo', 'bar'],
  allOf: [
    {
      properties: {
        foo: { type: 'integer', minimum: 2 },
        bar: { type: 'string', minLength: 2 },
      },
      additionalProperties: false,
    },
  ],
  errorMessage: {
    type: 'data should be an object',
    properties: {
      foo: 'data.foo should be integer >= 2',
      bar: 'data.bar should be string with length >= 2',
    },
    _: 'data should have properties "foo" and "bar" only',
  },
};

export const validDataF: DataF = { foo: 666, bar: 'kt' };
export const invalidDataF = {};
export const undefinedDataF = { foo: 1, bar: undefined };
export const invalidTypeDataF = 'something';

export const fieldsRest: Record<InternalFieldName, Field['_f']> = {
  foo: {
    ref: { name: 'foo' },
    name: 'foo',
  },
  bar: {
    ref: { name: 'bar' },
    name: 'bar',
  },
  lorem: {
    ref: { name: 'lorem' },
    name: 'lorem',
  },
};
