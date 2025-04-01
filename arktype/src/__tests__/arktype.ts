import { type } from 'arktype';
import { Resolver, useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form';
import { arktypeResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('arktypeResolver', () => {
  it('should return values from arktypeResolver when validation pass & raw=true', async () => {
    const result = await arktypeResolver(schema, undefined, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from arktypeResolver when validation fails', async () => {
    const result = await arktypeResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a arktype schema', () => {
    const resolver = arktypeResolver(type({ id: 'number' }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a arktype schema using a transform', () => {
    const resolver = arktypeResolver(
      type({ id: type('string').pipe((s) => Number.parseInt(s)) }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: string }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a arktype schema for the handleSubmit function in useForm', () => {
    const schema = type({ id: 'number' });

    const form = useForm({
      resolver: arktypeResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a arktype schema with a transform for the handleSubmit function in useForm', () => {
    const schema = type({ id: type('string').pipe((s) => Number.parseInt(s)) });

    const form = useForm({
      resolver: arktypeResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<string>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });
});
