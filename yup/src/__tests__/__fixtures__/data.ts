import { Field, InternalFieldName } from 'react-hook-form';
import * as yup from 'yup';

export const schema = yup.object({
  username: yup.string().matches(/^\w+$/).min(3).max(30).required(),
  password: yup
    .string()
    .matches(/^[a-zA-Z0-9]{3,30}/)
    .required(),
  repeatPassword: yup.ref('password'),
  accessToken: yup.string(),
  birthYear: yup.number().min(1900).max(2013),
  email: yup.string().email(),
  tags: yup.array(yup.string()),
  enabled: yup.boolean(),
  like: yup.array().of(
    yup.object({
      id: yup.number().required(),
      name: yup.string().length(4).required(),
    }),
  ),
});

export const validData: yup.InferType<typeof schema> = {
  username: 'Doe',
  password: 'Password123',
  repeatPassword: 'Password123',
  birthYear: 2000,
  email: 'john@doe.com',
  tags: ['tag1', 'tag2'],
  enabled: true,
  accessToken: 'accessToken',
  like: [
    {
      id: 1,
      name: 'name',
    },
  ],
};

export const invalidData = {
  password: '___',
  email: '',
  birthYear: 'birthYear',
  like: [{ id: 'z' }],
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
