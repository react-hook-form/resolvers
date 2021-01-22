import * as Joi from 'joi';
import { joiResolver } from '..';

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  repeatPassword: Joi.ref('password'),
  accessToken: [Joi.string(), Joi.number()],
  birthYear: Joi.number().integer().min(1900).max(2013),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net'] },
  }),
  tags: Joi.array().items(Joi.string()).required(),
  enabled: Joi.boolean().required(),
});

interface Data {
  username: string;
  password: string;
  repeatPassword: string;
  accessToken?: number | string;
  birthYear?: number;
  email?: string;
  tags: string[];
  enabled: boolean;
}

describe('joiResolver', () => {
  it('should return values from joiResolver when validation pass', async () => {
    const data: Data = {
      username: 'Doe',
      password: 'Password123',
      repeatPassword: 'Password123',
      birthYear: 2000,
      email: 'john@doe.com',
      tags: ['tag1', 'tag2'],
      enabled: true,
    };

    const validateAsyncSpy = jest.spyOn(schema, 'validateAsync');
    const validateSpy = jest.spyOn(schema, 'validate');

    const result = await joiResolver(schema)(data);

    expect(validateSpy).not.toHaveBeenCalled();
    expect(validateAsyncSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: data });
  });

  it('should return values from joiResolver with `mode: sync` when validation pass', async () => {
    const data: Data = {
      username: 'Doe',
      password: 'Password123',
      repeatPassword: 'Password123',
      birthYear: 2000,
      email: 'john@doe.com',
      tags: ['tag1', 'tag2'],
      enabled: true,
    };

    const validateAsyncSpy = jest.spyOn(schema, 'validateAsync');
    const validateSpy = jest.spyOn(schema, 'validate');

    const result = await joiResolver(schema, undefined, { mode: 'sync' })(data);

    expect(validateAsyncSpy).not.toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: data });
  });

  it('should return a single error from joiResolver when validation fails', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await joiResolver(schema)(data);

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from joiResolver with `mode: sync` when validation fails', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const validateAsyncSpy = jest.spyOn(schema, 'validateAsync');
    const validateSpy = jest.spyOn(schema, 'validate');

    const result = await joiResolver(schema, undefined, { mode: 'sync' })(data);

    expect(validateAsyncSpy).not.toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from joiResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await joiResolver(schema)(data, undefined, true);

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from joiResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const data = {
      password: '___',
      email: '',
      birthYear: 'birthYear',
    };

    const result = await joiResolver(schema, undefined, { mode: 'sync' })(
      data,
      undefined,
      true,
    );

    expect(result).toMatchSnapshot();
  });
});
