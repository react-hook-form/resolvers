import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { convexResolver } from '../convex';
import {
  SchemaInput,
  SchemaOutput,
  fields,
  invalidData,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('convexResolver', () => {
  it('should return values from convexResolver when validation pass', async () => {
    const result = await convexResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from convexResolver when validation fails', async () => {
    const result = await convexResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from convexResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await convexResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return values from convexResolver when validation pass & raw=true', async () => {
    const result = await convexResolver(schema, undefined, {
      raw: true,
    })(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a Convex-like schema', () => {
    const resolver = convexResolver(schema);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<SchemaInput, unknown, SchemaOutput>
    >();
  });

  it('should correctly infer the output type from a Convex-like schema for the handleSubmit function in useForm', () => {
    const form = useForm({
      resolver: convexResolver(schema),
      defaultValues: validData,
    });

    expectTypeOf(form.watch('username')).toEqualTypeOf<string | undefined>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<SchemaOutput>>();
  });
});
