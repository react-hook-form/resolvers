import { Field, InternalFieldName } from 'react-hook-form';
import * as t from 'typanion';

export const schema = t.isObject({
  username: t.cascade(t.isString(), [
    t.matchesRegExp(/^\w+$/),
    t.hasMinLength(2),
    t.hasMaxLength(30),
  ]),
  password: t.cascade(t.isString(), [
    t.matchesRegExp(new RegExp('.*[A-Z].*')), // one uppercase character
    t.matchesRegExp(new RegExp('.*[a-z].*')), // one lowercase character
    t.matchesRegExp(new RegExp('.*\\d.*')), // one number
    t.matchesRegExp(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
    ), // one special character
    t.hasMinLength(8), // Must be at least 8 characters in length
  ]),
  repeatPassword: t.cascade(t.isString(), [
    t.matchesRegExp(new RegExp('.*[A-Z].*')), // one uppercase character
    t.matchesRegExp(new RegExp('.*[a-z].*')), // one lowercase character
    t.matchesRegExp(new RegExp('.*\\d.*')), // one number
    t.matchesRegExp(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
    ), // one special character
    t.hasMinLength(8), // Must be at least 8 characters in length
  ]),
  accessToken: t.isString(),
  birthYear: t.cascade(t.isNumber(), [
    t.isInteger(),
    t.isInInclusiveRange(1900, 2013),
  ]),
  email: t.cascade(t.isString(), [t.matchesRegExp(/^\S+@\S+$/)]),
  tags: t.isArray(t.isString()),
  enabled: t.isBoolean(),
  like: t.isObject({
    id: t.cascade(t.isNumber(), [t.isInteger(), t.isPositive()]),
    name: t.cascade(t.isString(), [t.hasMinLength(4)]),
  }),
});

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
} as any as t.InferType<typeof schema>;

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
