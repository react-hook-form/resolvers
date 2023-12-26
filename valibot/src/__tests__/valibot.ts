/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { valibotResolver } from '..';
import {
  schema,
  validData,
  fields,
  invalidData,
  schemaError,
  validSchemaErrorData,
  invalidSchemaErrorData,
} from './__fixtures__/data';
import * as valibot from 'valibot';

const shouldUseNativeValidation = false;
describe('valibotResolver', () => {
  it('should return parsed values from valibotResolver with `mode: sync` when validation pass', async () => {
    vi.mock('valibot', async () => {
      const a = await vi.importActual<any>('valibot');
      return {
        __esModule: true,
        ...a,
      };
    });
    const parseSpy = vi.spyOn(valibot, 'parse');
    const parseAsyncSpy = vi.spyOn(valibot, 'parseAsync');

    const result = await valibotResolver(schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields, shouldUseNativeValidation });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result.errors).toEqual({});
    expect(result).toMatchSnapshot();
  });

  it('should return a single error from valibotResolver with `mode: sync` when validation fails', async () => {
    vi.mock('valibot', async () => {
      const a = await vi.importActual<any>('valibot');
      return {
        __esModule: true,
        ...a,
      };
    });
    const parseSpy = vi.spyOn(valibot, 'parse');
    const parseAsyncSpy = vi.spyOn(valibot, 'parseAsync');

    const result = await valibotResolver(schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields, shouldUseNativeValidation });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return values from valibotResolver when validation pass', async () => {
    const result = await valibotResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from valibotResolver when validation fails', async () => {
    const result = await valibotResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return values from valibotResolver when validation pass & raw=true', async () => {
    const result = await valibotResolver(schema, undefined, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return all the errors from valibotResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await valibotResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from valibotResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const result = await valibotResolver(schema, undefined, { mode: 'sync' })(
      invalidData,
      undefined,
      {
        fields,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should be able to validate variants', async () => {
    const result = await valibotResolver(schemaError, undefined, {
      mode: 'sync',
    })(validSchemaErrorData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({
      errors: {},
      values: {
        type: 'a',
      },
    });
  });

  it('should exit issue resolution if no path is set', async () => {
    const result = await valibotResolver(schemaError, undefined, {
      mode: 'sync',
    })(invalidSchemaErrorData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({
      errors: {},
      values: {},
    });
  });
});
