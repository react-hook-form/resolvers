import {
  object,
  number,
  string,
  optional,
  pattern,
  size,
  union,
  min,
  max,
  Infer,
  define,
  array,
  boolean,
} from 'superstruct';
import { superstructResolver } from '..';

const Password = define('Password', (value, ctx) =>
  value === ctx.branch[0].password);

const schema = object({
  username: size(pattern(string(), /^\w+$/), 3, 30),
  password: pattern(string(), /^[a-zA-Z0-9]{3,30}/),
  repeatPassword: Password,
  accessToken: optional(union([string(), number()])),
  birthYear: optional(max(min(number(), 1900), 2013)),
  email: optional(pattern(string(), /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)),
  tags: array(string()),
  enabled: boolean(),
});

describe('superstructResolver', () => {
  it('should return values from superstructResolver when validation pass', async () => {
    const data: Infer<typeof schema> = {
      username: 'Doe',
      password: 'Password123',
      repeatPassword: 'Password123',
      birthYear: 2000,
      email: 'john@doe.com',
      tags: ['tag1', 'tag2'],
      enabled: true,
    };

    const result = await superstructResolver(schema)(data, undefined, {
      fields: {},
    });

    expect(result).toEqual({ errors: {}, values: data });
  });

  it('should return a single error from superstructResolver when validation fails', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await superstructResolver(schema)(data, undefined, {
      fields: {},
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from superstructResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await superstructResolver(schema)(data, undefined, {
      fields: {},
      criteriaMode: 'all',
    });

    expect(result).toMatchSnapshot();
  });
});
