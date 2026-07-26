import { renderHook } from '@testing-library/react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { zodResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data-v3';

const shouldUseNativeValidation = false;

describe('zodResolver', () => {
  it('should return values from zodResolver when validation pass & raw=true', async () => {
    const parseAsyncSpy = vi.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(parseAsyncSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return parsed values from zodResolver with `mode: sync` when validation pass', async () => {
    const parseSpy = vi.spyOn(schema, 'parse');
    const parseAsyncSpy = vi.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields, shouldUseNativeValidation });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result.errors).toEqual({});
    expect(result).toMatchSnapshot();
  });

  it('should return a single error from zodResolver when validation fails', async () => {
    const result = await zodResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from zodResolver with `mode: sync` when validation fails', async () => {
    const parseSpy = vi.spyOn(schema, 'parse');
    const parseAsyncSpy = vi.spyOn(schema, 'parseAsync');

    const result = await zodResolver(schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields, shouldUseNativeValidation });

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseAsyncSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from zodResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await zodResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
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
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should surface the error from the union member closest to matching, not just the first member', async () => {
    const branchWithMoreIssues = z.object({
      id: z.number({ invalid_type_error: 'id wrong (branch B)' }),
      name: z.number({ invalid_type_error: 'name wrong (branch B)' }),
    });
    const branchWithFewerIssues = z.object({
      id: z.string(),
      name: z.number({
        invalid_type_error: 'name wrong (branch A, closer match)',
      }),
    });
    // branchWithMoreIssues is listed first, but only branchWithFewerIssues
    // actually comes close to matching the input (it only fails on `name`).
    const unionSchema = z.object({
      target: z.union([branchWithMoreIssues, branchWithFewerIssues]),
    });

    const result = await zodResolver(unionSchema)(
      { target: { id: 'abc', name: 'xyz' } } as unknown as z.input<
        typeof unionSchema
      >,
      undefined,
      { fields: {}, shouldUseNativeValidation },
    );

    expect(result.errors).toMatchObject({
      target: { message: 'name wrong (branch A, closer match)' },
    });
  });

  it('should throw any error unrelated to Zod', async () => {
    const schemaWithCustomError = schema.refine(() => {
      throw Error('custom error');
    });
    const promise = zodResolver(schemaWithCustomError)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    await expect(promise).rejects.toThrow('custom error');
  });

  it('should enforce parse params type signature', async () => {
    const resolver = zodResolver(schema, {
      async: true,
      path: ['asdf', 1234],
      errorMap(iss, ctx) {
        iss.path;
        iss.code;
        iss.path;
        ctx.data;
        ctx.defaultError;
        return { message: 'asdf' };
      },
    });

    resolver;
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a zod schema', () => {
    const resolver = zodResolver(z.object({ id: z.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a zod schema using a transform', () => {
    const resolver = zodResolver(
      z.object({ id: z.number().transform((val) => String(val)) }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a zod schema when a different input type is specified', () => {
    const schema = z.object({ id: z.number() }).transform(({ id }) => {
      return { id: String(id) };
    });

    const resolver = zodResolver<{ id: number }, any, z.output<typeof schema>>(
      schema,
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, any, { id: string }>
    >();
  });

  it('should correctly infer the output type from a Zod schema for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number() });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: zodResolver(schema),
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a Zod schema with a transform for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number().transform((val) => String(val)) });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: zodResolver(schema),
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });

  it('should accept a dynamically selected schema typed via the generic z.ZodType annotation', async () => {
    // https://github.com/react-hook-form/resolvers/issues/782 — schemas
    // chosen conditionally between two shapes and annotated with the base
    // `z.ZodType<Output>` (rather than a concrete subclass like `ZodObject`)
    // don't statically expose `_def.typeName`, even though they're genuine
    // Zod 3 schema instances at runtime.
    const updateSchema = z.object({ id: z.string(), name: z.string() });
    const createSchema = z.object({ name: z.string() });
    const useUpdateSchema = true;
    const dynamicSchema = (
      useUpdateSchema ? updateSchema : createSchema
    ) as z.ZodType<{ name: string }>;

    const resolver = zodResolver(dynamicSchema);

    const result = await resolver({ id: '1', name: 'John' } as any, undefined, {
      fields: {},
      shouldUseNativeValidation,
    });

    expect(result.errors).toEqual({});
  });
});
