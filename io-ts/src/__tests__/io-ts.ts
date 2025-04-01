import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { ioTsResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('ioTsResolver', () => {
  it('should return values from ioTsResolver when validation pass', async () => {
    const validateSpy = vi.spyOn(schema, 'decode');

    const result = ioTsResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(validateSpy).toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from ioTsResolver when validation fails', () => {
    const result = ioTsResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from ioTsResolver when validation fails with `validateAllFieldCriteria` set to true', () => {
    const result = ioTsResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a io-ts schema', () => {
    const resolver = ioTsResolver(t.type({ id: t.number }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a io-ts schema using a transform', () => {
    const resolver = ioTsResolver(t.type({ id: tt.NumberFromString }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: string }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a io-ts schema for the handleSubmit function in useForm', () => {
    const schema = t.type({ id: t.number });

    const form = useForm({
      resolver: ioTsResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a io-ts schema with a transform for the handleSubmit function in useForm', () => {
    const schema = t.type({ id: tt.NumberFromString });

    const form = useForm({
      resolver: ioTsResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<string>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });
});
