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
  password: yup
    .string()
    .required()
    .min(8)
    .matches(RegExp('(.*[a-z].*)'), 'Lowercase')
    .matches(RegExp('(.*[A-Z].*)'), 'Uppercase')
    .matches(RegExp('(.*\\d.*)'), 'Number')
    .matches(RegExp('[!@#$%^&*(),.?":{}|<>]'), 'Special'),
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
      password: '[}tehk6Uor',
      createdOn: '2014-09-23T19:25:25Z',
      foo: [{ yup: true }],
    };
    expect(await yupResolver(schema)(data)).toEqual({
      errors: {},
      values: {
        name: 'jimmy',
        age: 24,
        password: '[}tehk6Uor',
        foo: [{ yup: true }],
        createdOn: new Date('2014-09-23T19:25:25Z'),
      },
    });
  });

  describe('errors', () => {
    it('should get errors with validate all criteria fields', async () => {
      const data = {
        name: 2,
        age: 'test',
        password: '',
        createdOn: null,
        foo: [{ loose: null }],
      };
      const resolve = await yupResolver(schema)(data, {}, true);
      expect(resolve).toMatchSnapshot();
      expect(resolve.errors['age'].types).toMatchInlineSnapshot(`
          Object {
            "typeError": Array [
              "age must be a \`number\` type, but the final value was: \`NaN\` (cast from the value \`\\"test\\"\`).",
            ],
          }
        `);
      expect(resolve.errors['createdOn'].types).toMatchInlineSnapshot(`
        Object {
          "typeError": Array [
            "createdOn must be a \`date\` type, but the final value was: \`Invalid Date\`.",
          ],
        }
      `);
      expect(resolve.errors['password'].types).toMatchInlineSnapshot(`
          Object {
            "matches": Array [
              "Special",
              "Number",
              "Uppercase",
              "Lowercase",
            ],
            "min": Array [
              "password must be at least 8 characters",
            ],
            "required": Array [
              "password is a required field",
            ],
          }
        `);
    });

    it('should get errors without validate all criteria fields', async () => {
      const data = {
        name: 2,
        age: 'test',
        createdOn: null,
        foo: [{ loose: null }],
      };
      const resolve = await yupResolver(schema)(data);
      expect(await yupResolver(schema)(data)).toMatchSnapshot();
      expect(resolve.errors['age'].types).toMatchInlineSnapshot(`
        Object {
          "typeError": "age must be a \`number\` type, but the final value was: \`NaN\` (cast from the value \`\\"test\\"\`).",
        }
      `);
      expect(resolve.errors['createdOn'].types).toMatchInlineSnapshot(`
        Object {
          "typeError": "createdOn must be a \`date\` type, but the final value was: \`Invalid Date\`.",
        }
      `);
      expect(resolve.errors['password'].types).toMatchInlineSnapshot(`
        Object {
          "required": "password is a required field",
        }
      `);
    });

    it('should get error if yup errors has no inner errors', async () => {
      const data = {
        name: 2,
        age: 'test',
        createdOn: null,
        foo: [{ loose: null }],
      };
      const resolve = await yupResolver(schema, {
        abortEarly: true,
      })(data);
      expect(resolve.errors).toMatchInlineSnapshot(`
        Object {
          "createdOn": Object {
            "message": "createdOn must be a \`date\` type, but the final value was: \`Invalid Date\`.",
            "type": "typeError",
          },
        }
      `);
    });
  });

  it('should pass down the yup context', async () => {
    const data = { name: 'eric' };
    const context = { min: true };
    const schemaWithContext = yup.object().shape({
      name: yup
        .string()
        .required()
        .when('$min', (min: boolean, schema: yup.StringSchema) => {
          return min ? schema.min(6) : schema;
        }),
    });
    schemaWithContext.validate = jest.fn().mockResolvedValue({});
    await yupResolver(schemaWithContext)(data, context);
    expect(schemaWithContext.validate).toHaveBeenCalled();
    expect(schemaWithContext.validate).toHaveBeenCalledWith(data, {
      abortEarly: false,
      context,
    });
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

  it('should return an error based on the user context', async () => {
    const data = { name: 'eric' };
    const schemaWithContext = yup.object().shape({
      name: yup
        .string()
        .required()
        .when('$min', (min: boolean, schema: yup.StringSchema) => {
          return min ? schema.min(6) : schema;
        }),
    });
    expect(await yupResolver(schemaWithContext)(data, { min: true }))
      .toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "name": Object {
            "message": "name must be at least 6 characters",
            "type": "min",
            "types": Object {
              "min": "name must be at least 6 characters",
            },
          },
        },
        "values": Object {},
      }
    `);
  });
});
