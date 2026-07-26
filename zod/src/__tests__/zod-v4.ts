import { renderHook } from '@testing-library/react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data-v4';

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
      id: z.string().refine(() => false, { error: 'id wrong (branch B)' }),
      name: z.string().refine(() => false, { error: 'name wrong (branch B)' }),
    });
    const branchWithFewerIssues = z.object({
      id: z.string(),
      name: z
        .string()
        .refine((v) => v.length >= 5, { error: 'name too short' }),
    });
    // branchWithMoreIssues is listed first, but only branchWithFewerIssues
    // actually comes close to matching the input (it only fails on `name`).
    const unionSchema = z.union([branchWithMoreIssues, branchWithFewerIssues]);

    const result = await zodResolver(unionSchema)(
      { id: 'abc', name: 'yo' },
      undefined,
      { fields: {}, shouldUseNativeValidation },
    );

    expect(result.errors).toMatchObject({
      '': { message: 'name too short' },
    });
  });

  it('should not throw when a discriminated union is submitted without its discriminator set', async () => {
    // https://github.com/react-hook-form/resolvers/issues/ (zod4
    // discriminatedUnion with no matching discriminator used to throw
    // "t.errors[0] is undefined" / "Cannot read properties of undefined
    // (reading '0')" instead of reporting a validation error).
    const unionSchema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('foo') }),
      z.object({ type: z.literal('bar') }),
    ]);

    const result = await zodResolver(unionSchema)(
      {} as unknown as z.input<typeof unionSchema>,
      undefined,
      { fields: {}, shouldUseNativeValidation },
    );

    expect(result.errors).toMatchObject({
      type: { type: 'invalid_union' },
    });
  });

  it('should not throw when a discriminated union member is itself a discriminated union whose discriminator is missing', async () => {
    // https://github.com/react-hook-form/resolvers/issues/... (nested
    // discriminatedUnion whose own discriminator is absent used to throw
    // "Cannot read properties of undefined (reading '0')" instead of
    // reporting a validation error).
    const baseNested = {
      type: z.literal('b'),
      name: z.string().nonempty(),
      nested_type: z.enum(['nested_1', 'nested_2']),
    };

    const nestedUnionSchema = z.object({
      my_array: z.array(
        z.discriminatedUnion('type', [
          z.object({
            type: z.literal('a'),
            name: z.string().nonempty(),
          }),
          z.discriminatedUnion('nested_type', [
            z.object({
              ...baseNested,
              nested_type: z.literal('nested_1'),
              role_other: z.string().nonempty(),
            }),
            z.object({
              ...baseNested,
              nested_type: z.literal('nested_2'),
            }),
          ]),
        ]),
      ),
    });

    const result = await zodResolver(nestedUnionSchema)(
      // `type: 'b'` matches the second (nested) union, but its own
      // `nested_type` discriminator is missing.
      { my_array: [{ type: 'b' }] } as unknown as z.input<
        typeof nestedUnionSchema
      >,
      undefined,
      { fields: {}, shouldUseNativeValidation },
    );

    expect(result.errors).toMatchObject({
      my_array: [{ nested_type: { type: 'invalid_union' } }],
    });
  });

  it("should use the schema's own bound parse/parseAsync method rather than a standalone zod/v4/core import", async () => {
    // Bundlers that can resolve `zod` and `zod/v4/core` to two distinct
    // module instances (e.g. Metro with package-exports resolution enabled)
    // would silently drop any `z.config()`/locale the app configured on its
    // own zod instance if this resolver called a standalone parse function
    // from its own `zod/v4/core` import instead of the schema's own method.
    // Proven here by making the schema's own `parseAsync` throw a distinct
    // error and asserting the resolver actually surfaces it, rather than
    // independently re-validating via some other zod reference.
    const testSchema = z.object({ name: z.string() });
    const customIssue: z.core.$ZodIssue = {
      code: 'custom',
      message: 'error from the schema instance, not a separate zod import',
      path: ['name'],
      input: undefined,
    };
    vi.spyOn(testSchema, 'parseAsync').mockRejectedValueOnce(
      new z.core.$ZodError([customIssue]),
    );

    const result = await zodResolver(testSchema)({ name: '' }, undefined, {
      fields: {},
      shouldUseNativeValidation,
    });

    expect(result.errors).toMatchObject({
      name: {
        message: 'error from the schema instance, not a separate zod import',
      },
    });
  });

  it('should not misdetect a zod4 schema as zod3 (both have an object-shaped `_def`)', async () => {
    // The zod3 detection was loosened to only require an object-shaped
    // `_def` (see issue #782 — dynamically selected schemas typed via the
    // generic `z.ZodType<Output>` annotation don't statically expose
    // `_def.typeName`). Zod 4 schemas also have an object-shaped `_def`
    // (just without `typeName`), so zod4 must be detected first via its
    // unambiguous `_zod` marker — otherwise this would incorrectly take the
    // zod3 code path and mishandle zod4's error shape.
    const testSchema = z.object({ name: z.string() });

    const result = await zodResolver(testSchema)(
      { name: 123 as any },
      undefined,
      {
        fields: {},
        shouldUseNativeValidation,
      },
    );

    expect(result.errors).toMatchObject({
      name: { type: 'invalid_type' },
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
      jitless: true,
      reportInput: true,
      error(iss) {
        iss.path;
        iss.code;
        iss.path;
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
});
