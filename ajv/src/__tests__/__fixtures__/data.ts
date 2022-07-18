import { JSONSchemaType } from 'ajv';
import { Field, InternalFieldName } from 'react-hook-form';

interface Data {
  username: string;
  password: string;
  deepObject: { data: string; twoLayersDeep: { name: string } };
}

interface Email {
  email: string;
}

export const schema: JSONSchemaType<Data> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
    },
    password: {
      type: 'string',
      pattern: '.*[A-Z].*',
      errorMessage: {
        pattern: 'One uppercase character',
      },
    },
    deepObject: {
      type: 'object',
      nullable: true,
      properties: {
        data: { type: 'string' },
        twoLayersDeep: {
          type: 'object',
          properties: { name: { type: 'string' } },
          additionalProperties: false,
          required: ['name'],
        },
      },
      required: ['data', 'twoLayersDeep'],
    },
  },
  required: ['username', 'password', 'deepObject'],
  additionalProperties: false,
};

export const validData: Data = {
  username: 'jsun969',
  password: 'validPassword',
  deepObject: {
    twoLayersDeep: {
      name: 'deeper',
    },
    data: 'data',
  },
};

export const invalidData = {
  username: '__',
  password: 'invalid-password',
  deepObject: {
    data: 233,
    twoLayersDeep: { name: 123 },
  },
};

export const fields: Record<InternalFieldName, Field['_f']> = {
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

export const schemaFormat: JSONSchemaType<Email> = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      errorMessage: {
        format: 'email format is not valid',
      },
    },
  },
  required: ['email'],
  additionalProperties: false,
};

export const validEmail: Email = {
  email: 'asdf@asdf.as',
};

export const invalidEmail: Email = {
  email: `invalid email`,
};
