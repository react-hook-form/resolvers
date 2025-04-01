import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import * as s from 'superstruct';
import { superstructResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('superstructResolver', () => {
  it('should return values from superstructResolver when validation pass', async () => {
    const result = await superstructResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return values from superstructResolver with coerced values', async () => {
    const result = await superstructResolver(
      s.object({
        id: s.coerce(s.number(), s.string(), (val) => String(val)),
      }),
    )({ id: 1 }, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: { id: '1' } });
  });

  it('should return a single error from superstructResolver when validation fails', async () => {
    const result = await superstructResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return values from superstructResolver when validation pass & raw=true', async () => {
    const result = await superstructResolver(schema, undefined, { raw: true })(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(result).toEqual({ errors: {}, values: validData });
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a superstruct schema', () => {
    const resolver = superstructResolver(s.object({ id: s.number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a superstruct schema for the handleSubmit function in useForm', () => {
    const schema = s.object({ id: s.number() });

    const form = useForm({
      resolver: superstructResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a superstruct schema with a transform for the handleSubmit function in useForm', () => {
    const schema = s.object({
      id: s.coerce(s.string(), s.number(), (val) => String(val)),
    });

    const form = useForm({
      resolver: superstructResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<string>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
