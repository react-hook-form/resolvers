import { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Resolver } from 'react-hook-form';
import * as v from 'valibot';
/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { valibotResolver } from '..';
import {
  fields,
  invalidData,
  invalidSchemaErrorData,
  schema,
  schemaError,
  validData,
  validSchemaErrorData,
} from './__fixtures__/data';

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
    const funcSpy = vi.spyOn(v, 'safeParseAsync');

    const result = await valibotResolver(schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields, shouldUseNativeValidation });

    expect(funcSpy).toHaveBeenCalledTimes(1);
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
    const funcSpy = vi.spyOn(v, 'safeParseAsync');

    const result = await valibotResolver(schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields, shouldUseNativeValidation });

    expect(funcSpy).toHaveBeenCalledTimes(1);
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

  it('should be able to validate variants without errors', async () => {
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

  it('should be able to validate variants with errors', async () => {
    const result = await valibotResolver(schemaError, undefined, {
      mode: 'sync',
    })(invalidSchemaErrorData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({
      errors: {
        type: {
          message: 'Invalid type: Expected ("a" | "b") but received "c"',
          ref: undefined,
          type: 'variant',
        },
      },
      values: {},
    });
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a valibot schema', () => {
    const resolver = valibotResolver(v.object({ id: v.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a valibot schema using a transform', () => {
    const resolver = valibotResolver(
      v.object({
        id: v.pipe(
          v.number(),
          v.transform((val) => String(val)),
        ),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a valibot schema for the handleSubmit function in useForm', () => {
    const schema = v.object({ id: v.number() });

    const form = useForm({
      resolver: valibotResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a valibot schema with a transform for the handleSubmit function in useForm', () => {
    const schema = v.object({
      id: v.pipe(
        v.number(),
        v.transform((val) => String(val)),
      ),
    });

    const form = useForm({
      resolver: valibotResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
