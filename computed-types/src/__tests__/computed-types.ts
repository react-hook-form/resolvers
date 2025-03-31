import Schema, { number } from 'computed-types';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { computedTypesResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('computedTypesResolver', () => {
  it('should return values from computedTypesResolver when validation pass', async () => {
    const result = await computedTypesResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from computedTypesResolver when validation fails', async () => {
    const result = await computedTypesResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should throw any error unrelated to computed-types', async () => {
    const schemaWithCustomError = schema.transform(() => {
      throw Error('custom error');
    });

    const promise = computedTypesResolver(schemaWithCustomError)(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    await expect(promise).rejects.toThrow('custom error');
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a computedTypes schema', () => {
    const resolver = computedTypesResolver(Schema({ id: number }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a computedTypes schema using a transform', () => {
    const resolver = computedTypesResolver(
      Schema({ id: number.transform((val) => String(val)) }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a computedTypes schema for the handleSubmit function in useForm', () => {
    const schema = Schema({ id: number });

    const form = useForm({
      resolver: computedTypesResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a computedTypes schema with a transform for the handleSubmit function in useForm', () => {
    const schema = Schema({ id: number.transform((val) => String(val)) });

    const form = useForm({
      resolver: computedTypesResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
