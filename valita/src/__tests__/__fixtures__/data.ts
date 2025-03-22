import * as v from '@badrap/valita';
import { Field, InternalFieldName } from 'react-hook-form';

function strMinMaxLen(min: number, max: number) {
  return (value: string) => {
    if (value.length < min) {
      return v.err(`Must be at least ${min} characters in length`);
    }
    if (value.length > max) {
      return v.err(`Must be at most ${max} characters in length`);
    }
    return v.ok(value);
  };
}

function strMinLen(min: number) {
  return (value: string) => {
    if (value.length < min) {
      return v.err(`Must be at least ${min} characters in length`);
    }
    return v.ok(value);
  };
}

function strRegex(regex: RegExp, message: string) {
  return (value: string) => {
    if (!regex.test(value)) {
      return v.err(message);
    }
    return v.ok(value);
  };
}

function strPassword() {
  return v
    .string()
    .chain(strRegex(new RegExp('.*[A-Z].*'), 'One uppercase character'))
    .chain(strRegex(new RegExp('.*[a-z].*'), 'One lowercase character'))
    .chain(strRegex(new RegExp('.*\\d.*'), 'One number'))
    .chain(
      strRegex(
        new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
        'One special character',
      ),
    )
    .chain(strMinLen(8));
}

function numberMin(min: number) {
  return (value: number) => {
    if (value < min) {
      return v.err(`Must be at least ${min}`);
    }
    return v.ok(value);
  };
}

function numberMax(max: number) {
  return (value: number) => {
    if (value > max) {
      return v.err(`Must be at most ${max}`);
    }
    return v.ok(value);
  };
}

function strEmail() {
  return (value: string) => {
    if (!value.includes('@')) {
      return v.err('Invalid email address');
    }
    return v.ok(value);
  };
}

export const schema = v.object({
  username: v.string().chain(strMinMaxLen(2, 20)),
  password: strPassword(),
  repeatPassword: strPassword(),
  accessToken: v.union(v.string(), v.number()),
  birthYear: v.number().chain(numberMin(1900)).chain(numberMax(2021)),
  email: v.string().chain(strEmail()),
  tags: v.array(v.string()),
  enabled: v.boolean(),
  like: v.object({
    id: v.number(),
    name: v.string().chain(strMinLen(4)),
  }),
});

export const schemaError = v.union(
  v.object({ type: v.literal('a') }),
  v.object({ type: v.literal('b') }),
);

export const validSchemaErrorData = { type: 'a' } as v.Infer<
  typeof schemaError
>;

export const invalidSchemaErrorData = { type: 'c' } as any as v.Infer<
  typeof schemaError
>;

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
} as any as v.Infer<typeof schema>;

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
