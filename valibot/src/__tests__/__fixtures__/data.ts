import { Field, InternalFieldName } from 'react-hook-form';
import {
  object,
  string,
  minLength,
  maxLength,
  regex,
  number,
  minValue,
  maxValue,
  email,
  array,
  boolean,
  required,
  union,
  variant,
  literal,
} from 'valibot';

export const schema = required(
  object({
    username: string([minLength(2), maxLength(30), regex(/^\w+$/)]),
    password: string('New Password is required', [
      regex(new RegExp('.*[A-Z].*'), 'One uppercase character'),
      regex(new RegExp('.*[a-z].*'), 'One lowercase character'),
      regex(new RegExp('.*\\d.*'), 'One number'),
      regex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character',
      ),
      minLength(8, 'Must be at least 8 characters in length'),
    ]),
    repeatPassword: string('Repeat Password is required'),
    accessToken: union(
      [
        string('Access token should be a string'),
        number('Access token  should be a number'),
      ],
      'access token is required',
    ),
    birthYear: number('Please enter your birth year', [
      minValue(1900),
      maxValue(2013),
    ]),
    email: string([email('Invalid email address')]),
    tags: array(string('Tags should be strings')),
    enabled: boolean(),
    like: required(
      object({
        id: number('Like id is required'),
        name: string('Like name is required', [minLength(4, 'Too short')]),
      }),
    ),
  }),
);

export const schemaError = variant('type', [
  object({ type: literal('a') }),
  object({ type: literal('b') }),
]);

export const validSchemaErrorData = { type: 'a' };
export const invalidSchemaErrorData = { type: 'c' };

export const validData = {
  username: 'Doe',
  password: 'Password123_',
  repeatPassword: 'Password123_',
  birthYear: 2000,
  email: 'john@doe.com',
  tags: ['tag1', 'tag2'],
  enabled: true,
  accessToken: 'accessToken',
  like: {
    id: 1,
    name: 'name',
  },
};

export const invalidData = {
  password: '___',
  email: '',
  birthYear: 'birthYear',
  like: { id: 'z' },
  tags: [1, 2, 3],
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
