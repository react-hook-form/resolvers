import * as vest from 'vest';
import { vestResolver } from '..';

const validationSuite = vest.create('form', (data: any = {}) => {
  vest.test('username', 'Username is required', () => {
    vest.enforce(data.username).isNotEmpty();
  });

  vest.test('username', 'Must be longer than 3 chars', () => {
    vest.enforce(data.username).longerThan(3);
  });

  vest.test('deepObject.data', 'deepObject.data is required', () => {
    vest.enforce(data.deepObject.data).isNotEmpty();
  });

  vest.test('password', 'Password is required', () => {
    vest.enforce(data.password).isNotEmpty();
  });

  vest.test('password', 'Password must be at least 5 chars', () => {
    vest.enforce(data.password).longerThanOrEquals(5);
  });

  vest.test('password', 'Password must contain a digit', () => {
    vest.enforce(data.password).matches(/[0-9]/);
  });

  vest.test('password', 'Password must contain a symbol', () => {
    vest.enforce(data.password).matches(/[^A-Za-z0-9]/);
  });
});

describe('vestResolver', () => {
  it('should return values from vestResolver when validation pass', async () => {
    const data = {
      username: 'asdda',
      password: 'asddfg123!',
      deepObject: {
        data: 'test',
      },
    };
    expect(await vestResolver(validationSuite)(data)).toEqual({
      values: data,
      errors: {},
    });
  });

  it('should return values from vestResolver with `mode: sync` when validation pass', async () => {
    const data = {
      username: 'asdda',
      password: 'asddfg123!',
      deepObject: {
        data: 'test',
      },
    };
    expect(
      await vestResolver(validationSuite, undefined, { mode: 'sync' })(data),
    ).toEqual({
      values: data,
      errors: {},
    });
  });

  it('should return single error message from vestResolver when validation fails and validateAllFieldCriteria set to false', async () => {
    const data = {
      username: '',
      password: 'a',
      deepObject: {
        data: '',
      },
    };

    expect(await vestResolver(validationSuite)(data)).toMatchSnapshot();
  });

  it('should return single error message from vestResolver when validation fails and validateAllFieldCriteria set to false and `mode: sync`', async () => {
    const data = {
      username: '',
      password: 'a',
      deepObject: {
        data: '',
      },
    };

    expect(
      await vestResolver(validationSuite, undefined, { mode: 'sync' })(data),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from vestResolver when validation fails and validateAllFieldCriteria set to true', async () => {
    const data = {
      username: '',
      password: 'a',
      deepObject: {
        data: '',
      },
    };

    expect(
      await vestResolver(validationSuite)(data, {}, true),
    ).toMatchSnapshot();
  });

  it('should return all the error messages from vestResolver when validation fails and validateAllFieldCriteria set to true and `mode: sync`', async () => {
    const data = {
      username: '',
      password: 'a',
      deepObject: {
        data: '',
      },
    };

    expect(
      await vestResolver(validationSuite, undefined, { mode: 'sync' })(
        data,
        {},
        true,
      ),
    ).toMatchSnapshot();
  });
});
