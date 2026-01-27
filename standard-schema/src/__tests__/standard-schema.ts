import { renderHook } from '@testing-library/react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { standardSchemaResolver } from '..';
import {
  customSchema,
  fields,
  invalidData,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('standardSchemaResolver', () => {
  it('should return values from standardSchemaResolver when validation pass', async () => {
    const result = await standardSchemaResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from standardSchemaResolver when validation fails', async () => {
    const result = await standardSchemaResolver(schema)(
      invalidData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from standardSchemaResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await standardSchemaResolver(schema)(
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

  it('should return values from standardSchemaResolver when validation pass & raw=true', async () => {
    const validateSpy = vi.spyOn(schema['~standard'], 'validate');

    const result = await standardSchemaResolver(schema, undefined, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result).toMatchSnapshot();
  });
  it('should correctly handle path segments that are objects', async () => {
    const result = await standardSchemaResolver(customSchema)(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return a root error when a standard schema issue has no path', async () => {
    const result = await standardSchemaResolver({
      '~standard': {
        version: 1,
        vendor: 'custom',
        validate: () => ({
          issues: [
            {
              message: 'Invalid input',
            },
          ],
        }),
      },
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should collect all root errors when validateAllFieldCriteria is true', async () => {
    const result = await standardSchemaResolver({
      '~standard': {
        version: 1,
        vendor: 'custom',
        validate: () => ({
          issues: [
            {
              message: 'Invalid union',
            },
            {
              message: 'Missing discriminator',
            },
          ],
        }),
      },
    })(validData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should preserve a root field error when a schema root error is present', async () => {
    const result = await standardSchemaResolver({
      '~standard': {
        version: 1,
        vendor: 'custom',
        validate: () => ({
          issues: [
            {
              path: [{ key: 'root' }],
              message: 'Root field error',
            },
            {
              message: 'Schema root error',
            },
          ],
        }),
      },
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result.errors).toMatchObject({
      root: {
        message: 'Root field error\nSchema root error',
      },
    });
  });

  it('should only keep the first error message for the same field path in `firstError` mode', async () => {
    const result = await standardSchemaResolver({
      '~standard': {
        version: 1,
        vendor: 'custom',
        validate: () => ({
          issues: [
            {
              path: [{ key: 'username' }],
              message: 'First username error',
            },
            {
              path: [{ key: 'username' }],
              message: 'Second username error',
            },
          ],
        }),
      },
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result.errors).toMatchObject({
      username: {
        message: 'First username error',
      },
    });
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a standardSchema schema', () => {
    const resolver = standardSchemaResolver(z.object({ id: z.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a standardSchema schema using a transform', () => {
    const resolver = standardSchemaResolver(
      z.object({ id: z.number().transform((val) => String(val)) }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a standardSchema schema when a different input type is specified', () => {
    const schema = z.object({ id: z.number() }).transform(({ id }) => {
      return { id: String(id) };
    });

    const resolver = standardSchemaResolver<
      { id: number },
      any,
      z.output<typeof schema>
    >(schema);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, any, { id: string }>
    >();
  });

  it('should correctly infer the output type from a standardSchema schema for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number() });
    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: standardSchemaResolver(schema),
        defaultValues: {
          id: 3,
        },
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a standardSchema schema with a transform for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number().transform((val) => String(val)) });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: standardSchemaResolver(schema),
        defaultValues: {
          id: 3,
        },
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
