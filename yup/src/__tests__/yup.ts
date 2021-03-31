/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import * as yup from 'yup';
import { yupResolver } from '..';

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

const schema = yup.object({
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
      age: 24,
      email: 'jimmy@mail.com',
      password: '[}tehk6Uor',
      website: 'https://react-hook-form.com/',
      createdOn: new Date('2014-09-23T19:25:25Z'),
      foo: [{ loose: true }],
    };
    expect(await yupResolver(schema)(data)).toEqual({
      errors: {},
      values: data,
    });
  });

  it('should pass down the yup context', async () => {
    const data = { name: 'eric' };
    const context = { min: true };
    const schemaWithContext = yup.object({
      name: yup
        .string()
        .required()
        .when('$min', (min: boolean, schema: yup.StringSchema) => {
          return min ? schema.min(6) : schema;
        }),
    });

    const schemaSpyValidate = jest.spyOn(schemaWithContext, 'validate');

    const output = await yupResolver(schemaWithContext)(data, context);
    expect(schemaSpyValidate).toHaveBeenCalledTimes(1);
    expect(schemaSpyValidate).toHaveBeenCalledWith(
      data,
      expect.objectContaining({
        abortEarly: false,
        context,
      }),
    );
    expect(output).toMatchSnapshot();
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

      const output = await yupResolver(schema)(data, {}, true);
      expect(output).toMatchSnapshot();
      expect(output.errors['foo']?.[0]?.['loose']).toBeDefined();
      expect(output.errors['foo']?.[0]?.['loose']?.types)
        .toMatchInlineSnapshot(`
        Object {
          "typeError": "foo[0].loose must be a \`boolean\` type, but the final value was: \`null\`.
         If \\"null\\" is intended as an empty value be sure to mark the schema as \`.nullable()\`",
        }
      `);
      expect(output.errors.age?.types).toMatchInlineSnapshot(`
        Object {
          "typeError": "age must be a \`number\` type, but the final value was: \`NaN\` (cast from the value \`\\"test\\"\`).",
        }
      `);
      expect(output.errors.createdOn?.types).toMatchInlineSnapshot(`
        Object {
          "typeError": "createdOn must be a \`date\` type, but the final value was: \`Invalid Date\`.",
        }
      `);
      expect(output.errors.password?.types).toMatchInlineSnapshot(`
        Object {
          "matches": Array [
            "Lowercase",
            "Uppercase",
            "Number",
            "Special",
          ],
          "min": "password must be at least 8 characters",
          "required": "password is a required field",
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

      const output = await yupResolver(schema)(data);
      expect(output).toMatchSnapshot();
      expect(output.errors.age?.types).toBeUndefined();
      expect(output.errors.createdOn?.types).toBeUndefined();
      expect(output.errors.password?.types).toBeUndefined();
    });

    it('should get error if yup errors has no inner errors', async () => {
      const data = {
        name: 2,
        age: 'test',
        createdOn: null,
        foo: [{ loose: null }],
      };
      const output = await yupResolver(schema, {
        abortEarly: true,
      })(data, undefined, true);

      expect(output.errors).toMatchInlineSnapshot(`
        Object {
          "createdOn": Object {
            "message": "createdOn must be a \`date\` type, but the final value was: \`Invalid Date\`.",
            "type": "typeError",
          },
        }
      `);
    });

    it('should return an error result if inner yup validation error has no path', async () => {
      const data = { name: '' };
      const schemaWithContext = yup.object().shape({
        name: yup.string().required(),
      });

      jest.spyOn(schemaWithContext, 'validate').mockRejectedValueOnce({
        inner: [{ path: '', message: 'error1', type: 'required' }],
      });

      const output = await yupResolver(schemaWithContext)(data);
      expect(output).toMatchSnapshot();
    });
  });
});

describe('validateWithSchema', () => {
  it('should return undefined when no error reported', async () => {
    const schema = yup.object();
    jest.spyOn(schema, 'validate').mockRejectedValueOnce(errors);

    expect(await yupResolver(schema)({})).toMatchSnapshot();
  });

  it('should return empty object when validate pass', async () => {
    const schema = yup.object();

    expect(await yupResolver(schema)({})).toMatchInlineSnapshot(`
      Object {
        "errors": Object {},
        "values": Object {},
      }
    `);
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
          },
        },
        "values": Object {},
      }
    `);
  });

  it('should show a warning log if yup context is used instead only on dev environment', async () => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn);
    process.env.NODE_ENV = 'development';

    await yupResolver(yup.object(), { context: { noContext: true } })({});
    expect(console.warn).toHaveBeenCalledWith(
      "You should not used the yup options context. Please, use the 'useForm' context object instead",
    );
    process.env.NODE_ENV = 'test';
  });

  it('should not show warning log if yup context is used instead only on production environment', async () => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn);
    process.env.NODE_ENV = 'production';

    await yupResolver(yup.object(), { context: { noContext: true } })({});
    expect(console.warn).not.toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('should return correct error message with using yup.test', async () => {
    const output = await yupResolver(
      yup
        .object({
          name: yup.string(),
          email: yup.string(),
        })
        .test(
          'name',
          'Email or name are required',
          (value) => !!(value && (value.name || value.email)),
        ),
    )({ name: '', email: '' });

    expect(output).toEqual({
      values: {},
      errors: { name: { message: 'Email or name are required', type: 'name' } },
    });
  });
});
