import * as typeschema from '@typeschema/main';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { typeschemaResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

vi.mock('@typeschema/main', async (importOriginal) => {
  const module: object = await importOriginal();
  return { ...module };
});

describe('typeschemaResolver', () => {
  it('should return values from typeschemaResolver when validation pass & raw=true', async () => {
    const validateSpy = vi.spyOn(typeschema, 'validate');

    const result = await typeschemaResolver(schema, undefined, { raw: true })(
      validData,
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return parsed values from typeschemaResolver when validation pass', async () => {
    const validateSpy = vi.spyOn(typeschema, 'validate');

    const result = await typeschemaResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(result.errors).toEqual({});
    expect(result).toMatchSnapshot();
  });

  it('should return a single error from typeschemaResolver when validation fails', async () => {
    const result = await typeschemaResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from typeschemaResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await typeschemaResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should throw any error unrelated to TypeSchema', async () => {
    const schemaWithCustomError = schema.refine(() => {
      throw Error('custom error');
    });
    const promise = typeschemaResolver(schemaWithCustomError)(
      validData,
      undefined,
      { fields, shouldUseNativeValidation },
    );

    await expect(promise).rejects.toThrow('custom error');
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a typeschema schema', () => {
    const resolver = typeschemaResolver(z.object({ id: z.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a typeschema schema using a transform', () => {
    const resolver = typeschemaResolver(
      z.object({ id: z.number().transform((val) => String(val)) }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a typeschema schema when a different input type is specified', () => {
    const schema = z.object({ id: z.number() }).transform(({ id }) => {
      return { id: String(id) };
    });

    const resolver = typeschemaResolver<
      { id: number },
      any,
      z.output<typeof schema>
    >(schema);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, any, { id: string }>
    >();
  });

  it('should correctly infer the output type from a typeschema schema for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number() });

    const form = useForm({
      resolver: typeschemaResolver(schema),
      defaultValues: {
        id: 3,
      },
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a typeschema schema with a transform for the handleSubmit function in useForm', () => {
    const schema = z.object({ id: z.number().transform((val) => String(val)) });

    const form = useForm({
      resolver: typeschemaResolver(schema),
      defaultValues: {
        id: 3,
      },
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
