import { Field, InternalFieldName } from 'react-hook-form';

interface Data {
  username: string;
  password: string;
  email?: string;
  birthday?: number;
  tags: string[];
  enabled: boolean;
  url: string;
  like?: { id: number; name: string }[];
  deepObject: { data: string; twoLayersDeep: { name: string } };
}

export const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 30,
      pattern: '^\\w+$',
    },
    password: {
      type: 'string',
      minLength: 8,
      pattern: '.*[A-Z].*',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    birthday: {
      type: 'integer',
      minimum: 1900,
      maximum: 2013,
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    enabled: {
      type: 'boolean',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
    like: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string', minLength: 4, maxLength: 4 },
        },
        required: ['id', 'name'],
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
  },
  required: ['username', 'password', 'tags', 'enabled', 'deepObject'],
  additionalProperties: false,
};

export const validData: Data = {
  username: 'Doe',
  password: 'Password123_',
  email: 'john@doe.com',
  birthday: 2000,
  tags: ['tag1', 'tag2'],
  enabled: true,
  url: 'https://react-hook-form.com/',
  like: [{ id: 1, name: 'name' }],
  deepObject: {
    data: 'data',
    twoLayersDeep: { name: 'deeper' },
  },
};

export const invalidData = {
  username: '__',
  password: 'invalid',
  email: '',
  birthday: 'birthYear',
  like: [{ id: 'z' }],
  url: 'abc',
  deepObject: {
    data: 233,
    twoLayersDeep: { name: 123 },
  },
};

export const invalidDataWithUndefined = {
  username: 'jsun969',
  password: undefined,
  deepObject: {
    twoLayersDeep: {
      name: 'deeper',
    },
    data: undefined,
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
