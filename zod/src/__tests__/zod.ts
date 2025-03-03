import { FieldValues, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

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

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a zod schema', () => {
    const resolver = zodResolver(z.object({ id: z.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<FieldValues, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a zod schema when a different input type is specified', () => {
    const schema = z.object({ id: z.number() });
    const resolver = zodResolver<{ id: string }, any, z.output<typeof schema>>(
      schema,
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: string }, any, { id: number }>
    >();
  });

  it('should correctly infer the output type from a zod schema when different input and output types are specified', () => {
    const resolver = zodResolver<
      { id: string },
      { context: any },
      { id: number }
    >(z.object({ id: z.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: string }, { context: any }, { id: number }>
    >();
  });

  it('should correctly infer the output type from a Zod schema for the handleSubmit function in useForm', () => {
    const { handleSubmit } = useForm({
      resolver: zodResolver(z.object({ id: z.number() })),
    });

    expectTypeOf(handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a Zod schema when a different input type is specified for the handleSubmit function in useForm', () => {
    const { handleSubmit } = useForm<{ id: number }>({
      resolver: zodResolver(z.object({ id: z.string() })),
    });

    expectTypeOf(handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });

  it('should correctly infer the output type from a Zod schema when different input and output types are specified for the handleSubmit function in useForm', () => {
    const { handleSubmit } = useForm<{ id: string }, any, { id: boolean }>({
      resolver: zodResolver(z.object({ id: z.number() })),
    });

    expectTypeOf(handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: boolean;
      }>
    >();
  });
});
