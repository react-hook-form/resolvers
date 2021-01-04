import * as Joi from 'joi';
import { joiResolver } from '..';

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),

  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

  repeatPassword: Joi.ref('password'),

  accessToken: [Joi.string(), Joi.number()],

  birthYear: Joi.number().integer().min(1900).max(2013),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net'] },
  }),
});

describe('joiResolver', () => {
  it('should return correct value', async () => {
    const data = { username: 'abc', birthYear: 1994 };
    expect(await joiResolver(schema)(data)).toEqual({
      values: data,
      errors: {},
    });
  });

  it('should return errors', async () => {
    expect(await joiResolver(schema)({})).toMatchSnapshot();
  });
});
