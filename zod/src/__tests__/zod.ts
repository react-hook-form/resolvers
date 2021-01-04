import * as z from 'zod';
import { zodResolver } from '..';

const schema = z
  .object({
    id: z.number(),
    title: z.string(),
    isPublished: z.boolean().optional(),
    tags: z.array(z.string()),
    author: z.object({
      id: z.number(),
    }),
    count: z.number().positive().int(),
    date: z.date(),
    url: z.string().url(),
    password: z
      .string()
      .min(8)
      .regex(RegExp('(.*[a-z].*)'))
      .regex(RegExp('(.*[A-Z].*)'))
      .regex(RegExp('(.*\\d.*)'))
      .regex(RegExp('[!@#$%^&*(),.?":{}|<>]')),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'], // set path of error
  });

describe('zodResolver', () => {
  it('should get values', async () => {
    const data = {
      id: 2,
      title: 'test',
      tags: ['news', 'features'],
      author: {
        id: 1,
      },
      count: 4,
      date: new Date(),
      url: 'https://github.com/react-hook-form/resolvers',
      password: '[}tehk6Uor',
      confirm: '[}tehk6Uor',
    };

    expect(await zodResolver(schema)(data)).toEqual({
      values: data,
      errors: {},
    });
  });

  it('should get errors without validate all criteria fields', async () => {
    const data: any = {
      id: '2',
      tags: [2, true],
      author: {
        id: '1',
      },
      count: 1,
      date: 'date',
      password: 'R',
      confirm: 'A',
      unknownProperty: '',
    };

    expect(await zodResolver(schema)(data)).toMatchSnapshot();
  });

  it('should get errors without validate all criteria fields', async () => {
    const data: any = {
      id: '2',
      tags: [2, true],
      author: {
        id: '1',
      },
      count: -5,
      date: 'date',
      password: 'R',
      confirm: 'R',
    };

    expect(await zodResolver(schema)(data, undefined, true)).toMatchSnapshot();
  });

  it('should get errors with zod error map', async () => {
    const data: any = {
      id: '2',
      tags: [2, true],
      author: {
        id: '1',
      },
      count: -5,
      date: 'date',
      password: 'R',
      confirm: 'R',
    };

    const errorMap: z.ZodErrorMap = (error, ctx) => {
      if (error.message) {
        return { message: error.message };
      }

      switch (error.code) {
        case z.ZodErrorCode.invalid_type:
          if (error.expected === 'string') {
            return { message: `This ain't a string!` };
          }
          break;
        case z.ZodErrorCode.custom_error:
          const params = error.params || {};
          if (params.myField) {
            return { message: `Bad input: ${params.myField}` };
          }
          break;
      }

      return { message: ctx.defaultError };
    };

    expect(await zodResolver(schema, { errorMap })(data)).toMatchSnapshot();
  });
});
