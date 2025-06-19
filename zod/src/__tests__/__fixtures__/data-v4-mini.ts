import { Field, InternalFieldName } from 'react-hook-form';
import { z } from 'zod/v4-mini';

export const schema = z
  .object({
    username: z
      .string()
      .check(z.regex(/^\w+$/), z.minLength(3), z.maxLength(30)),
    password: z
      .string()
      .check(
        z.regex(new RegExp('.*[A-Z].*'), 'One uppercase character'),
        z.regex(new RegExp('.*[a-z].*'), 'One lowercase character'),
        z.regex(new RegExp('.*\\d.*'), 'One number'),
        z.regex(
          new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
          'One special character',
        ),
        z.minLength(8, 'Must be at least 8 characters in length'),
      ),
    repeatPassword: z.string(),
    accessToken: z.union([z.string(), z.number()]),
    birthYear: z.optional(z.number().check(z.minimum(1900), z.maximum(2013))),
    email: z.optional(z.email()),
    tags: z.array(z.string()),
    enabled: z.boolean(),
    url: z.union([z.url('Custom error url'), z.literal('')]),
    like: z.optional(
      z.array(
        z.object({
          id: z.number(),
          name: z.string().check(z.length(4)),
        }),
      ),
    ),
    dateStr: z
      .pipe(
        z.string(),
        z.transform((value) => new Date(value)),
      )
      .check(
        z.refine((value) => !isNaN(value.getTime()), {
          message: 'Invalid date',
        }),
      ),
    auth: z.discriminatedUnion('type', [
      z.object({
        type: z.literal('registered'),
        passwordHash: z.string(),
      }),
      z.object({
        type: z.literal('guest'),
      }),
    ]),
  })
  .check(
    z.refine((obj) => obj.password === obj.repeatPassword, {
      message: 'Passwords do not match',
      path: ['confirm'],
    }),
  );

export const validData = {
  username: 'Doe',
  password: 'Password123_',
  repeatPassword: 'Password123_',
  birthYear: 2000,
  email: 'john@doe.com',
  tags: ['tag1', 'tag2'],
  enabled: true,
  accessToken: 'accessToken',
  url: 'https://react-hook-form.com/',
  like: [
    {
      id: 1,
      name: 'name',
    },
  ],
  dateStr: '2020-01-01',
  auth: {
    type: 'registered',
    passwordHash: 'hash',
  },
} satisfies z.input<typeof schema>;

export const invalidData = {
  password: '___',
  email: '',
  birthYear: 'birthYear',
  like: [{ id: 'z' }],
  url: 'abc',
  auth: { type: 'invalid' },
} as unknown as z.input<typeof schema>;

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
