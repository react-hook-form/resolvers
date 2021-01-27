import * as z from 'zod';
import { zodResolver } from '..';

const schema = z
  .object({
    username: z.string().regex(/^\w+$/).min(3).max(30),
    password: z.string().regex(/^[a-zA-Z0-9]{3,30}/),
    repeatPassword: z.string(),
    accessToken: z.union([z.string(), z.number()]).optional(),
    birthYear: z.number().min(1900).max(2013).optional(),
    email: z.string().email().optional(),
    tags: z.array(z.string()),
    enabled: z.boolean(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['confirm'], // set path of error
  });

describe('zodResolver', () => {
  it('should return values from zodResolver when validation pass', async () => {
    const data: z.infer<typeof schema> = {
      username: 'Doe',
      password: 'Password123',
      repeatPassword: 'Password123',
      birthYear: 2000,
      email: 'john@doe.com',
      tags: ['tag1', 'tag2'],
      enabled: true,
    };

    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema)(data, undefined, { fields: {} });

    expect(parseAsyncSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: data });
  });

  it('should return values from zodResolver with `mode: sync` when validation pass', async () => {
    const data: z.infer<typeof schema> = {
      username: 'Doe',
      password: 'Password123',
      repeatPassword: 'Password123',
      birthYear: 2000,
      email: 'john@doe.com',
      tags: ['tag1', 'tag2'],
      enabled: true,
    };

    const parseSpy = jest.spyOn(schema, 'parse');
    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, { mode: 'sync' })(
      data,
      undefined,
      { fields: {} },
    );

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: data });
  });

  it('should return a single error from zodResolver when validation fails', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await zodResolver(schema)(data, undefined, { fields: {} });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from zodResolver with `mode: sync` when validation fails', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const parseSpy = jest.spyOn(schema, 'parse');
    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, { mode: 'sync' })(
      data,
      undefined,
      { fields: {} },
    );

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from zodResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await zodResolver(schema)(data, undefined, {
      fields: {},
      criteriaMode: 'all',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from zodResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await zodResolver(schema, undefined, { mode: 'sync' })(
      data,
      undefined,
      {
        fields: {},
        criteriaMode: 'all',
      },
    );

    expect(result).toMatchSnapshot();
  });
});
