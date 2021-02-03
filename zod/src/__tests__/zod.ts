import { zodResolver } from '..';
import { schema, validData, invalidData, fields } from './__fixtures__/data';

describe('zodResolver', () => {
  it('should return values from zodResolver when validation pass', async () => {
    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema)(validData, undefined, {
      fields,
    });

    expect(parseAsyncSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return values from zodResolver with `mode: sync` when validation pass', async () => {
    const parseSpy = jest.spyOn(schema, 'parse');
    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from zodResolver when validation fails', async () => {
    const result = await zodResolver(schema)(invalidData, undefined, {
      fields,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from zodResolver with `mode: sync` when validation fails', async () => {
    const parseSpy = jest.spyOn(schema, 'parse');
    const parseAsyncSpy = jest.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from zodResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await zodResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from zodResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const result = await zodResolver(schema, undefined, { mode: 'sync' })(
      invalidData,
      undefined,
      {
        fields,
        criteriaMode: 'all',
      },
    );

    expect(result).toMatchSnapshot();
  });
});
