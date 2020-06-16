import * as yup from 'yup';
import { yupResolver } from './yup';

const errors = {
  name: 'ValidationError',
  value: { createdOn: '2019-03-27T04:05:51.503Z' },
  path: undefined,
  type: undefined,
  errors: ['name is a required field', 'age is a required field'],
  inner: [
    {
      name: 'ValidationError',
      value: undefined,
      path: 'name',
      type: 'required',
      errors: [],
      inner: [],
      message: 'name is a required field',
      params: [],
    },
    {
      name: 'ValidationError',
      value: undefined,
      path: 'name',
      type: 'min',
      errors: [],
      inner: [],
      message: 'name is a min field',
      params: [],
    },
    {
      name: 'ValidationError',
      value: undefined,
      path: 'age',
      type: 'required',
      errors: [],
      inner: [],
      message: 'age is a required field',
      params: [],
    },
  ],
};

const schema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
  email: yup.string().email(),
  website: yup.string().url(),
  createdOn: yup.date().default(function () {
    return new Date();
  }),
  foo: yup
    .array()
    .required()
    .of(
      yup.object({
        loose: yup.boolean(),
      }),
    ),
});

describe('yupResolver', () => {
  it('should get values', async () => {
    const data = {
      name: 'jimmy',
      age: '24',
      createdOn: '2014-09-23T19:25:25Z',
      foo: [{ yup: true }],
    };
    expect(await yupResolver(schema)(data)).toEqual({
      errors: {},
      values: {
        name: 'jimmy',
        age: 24,
        foo: [{ yup: true }],
        createdOn: new Date('2014-09-23T19:25:25Z'),
      },
    });
  });

  it('should get errors', async () => {
    const data = {
      name: 2,
      age: 'test',
      createdOn: null,
      foo: [{ loose: null }],
    };
    expect(await yupResolver(schema)(data)).toMatchSnapshot();
  });
});

describe('validateWithSchema', () => {
  it('should return undefined when no error reported', async () => {
    expect(
      await yupResolver({
        validate: () => {
          throw errors;
        },
      } as any)({}),
    ).toMatchSnapshot();
  });

  it('should return empty object when validate pass', async () => {
    expect(
      await yupResolver({
        validate: () => new Promise((resolve) => resolve()),
      } as any)({}),
    ).toEqual({
      errors: {},
      values: undefined,
    });
  });
});
