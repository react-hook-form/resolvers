import { JSONSchemaType } from 'ajv';
import { Field, InternalFieldName } from 'react-hook-form';

export interface Data {
  username: string;
  password: string;
  deepObject: { data: string; twoLayersDeep: { name: string } };
  optionalEmail?: string;
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
    optionalEmail: {
      type: 'string',
      pattern: '^[0-9a-zA-Z\.]+@[0-9a-zA-Z]+\.com$',
      nullable: true,
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

export const invalidData: any = {
  username: '__',
  password: 'invalid-password',
  deepObject: {
    data: 233,
    twoLayersDeep: { name: 123 },
  },
};

export const invalidDataWithUndefined: any = {
  username: 'jsun969',
  password: undefined,
  deepObject: {
    twoLayersDeep: {
      name: 'deeper',
    },
    data: undefined,
  },
};

export const emptyData: any = {};

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
