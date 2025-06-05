import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod/v4-mini';
import { zodResolver } from '..';
import {
  fields,
  invalidData,
  schema,
  validData,
} from './__fixtures__/data-v4-mini';

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
    result;

    expect(parseAsyncSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
    expectTypeOf(result.values);
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

  it('should throw any error unrelated to Zod', async () => {
    const schemaWithCustomError = schema.check(
      z.refine(() => {
        throw Error('custom error');
      }),
    );
    const promise = zodResolver(schemaWithCustomError)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    await expect(promise).rejects.toThrow('custom error');
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
      z.object({
        id: z.pipe(
          z.number(),
          z.transform((val) => String(val)),
        ),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a zod schema when a different input type is specified', () => {
    const schema = z.pipe(
      z.object({ id: z.number() }),
      z.transform(({ id }) => {
        return { id: String(id) };
      }),
    );

    const resolver = zodResolver<{ id: number }, any, z.output<typeof schema>>(
      schema,
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, any, { id: string }>
    >();
  });

  it('should correctly infer the output type from a Zod schema for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number() });

    const form = useForm({
      resolver: zodResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a Zod schema with a transform for the handleSubmit function in useForm', () => {
    const schema = z.object({
      id: z.pipe(
        z.number(),
        z.transform((val) => String(val)),
      ),
    });

    const form = useForm({
      resolver: zodResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
