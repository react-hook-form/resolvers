import { Schema } from 'effect';
import { Resolver, useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form';
import { effectTsResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('effectTsResolver', () => {
  it('should return values from effectTsResolver when validation pass', async () => {
    const result = await effectTsResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from effectTsResolver when validation fails', async () => {
    const result = await effectTsResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return the first error from effectTsResolver when validation fails with `validateAllFieldCriteria` set to firstError', async () => {
    const SignupSchema = Schema.Struct({
      phoneNumber: Schema.optional(
        Schema.String.pipe(
          Schema.pattern(/^\+\d{7,15}$/, {
            message: () =>
              'Please enter a valid phone number in international format.',
          }),
        ),
      ),
    });

    const result = await effectTsResolver(SignupSchema)(
      { phoneNumber: '123' },
      undefined,
      {
        fields: {
          phoneNumber: {
            ref: { name: 'phoneNumber' },
            name: 'phoneNumber',
          },
        },
        criteriaMode: 'firstError',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from effectTsResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const SignupSchema = Schema.Struct({
      phoneNumber: Schema.optional(
        Schema.String.pipe(
          Schema.pattern(/^\+\d{7,15}$/, {
            message: () =>
              'Please enter a valid phone number in international format.',
          }),
        ),
      ),
    });

    const result = await effectTsResolver(SignupSchema)(
      { phoneNumber: '123' },
      undefined,
      {
        fields: {
          phoneNumber: {
            ref: { name: 'phoneNumber' },
            name: 'phoneNumber',
          },
        },
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a effectTs schema', () => {
    const resolver = effectTsResolver(Schema.Struct({ id: Schema.Number }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<Readonly<{ id: number }>, unknown, Readonly<{ id: number }>>
    >();
  });

  it('should correctly infer the output type from a effectTs schema using a transform', () => {
    const resolver = effectTsResolver(
      Schema.Struct({
        id: Schema.transform(Schema.Number, Schema.String, {
          decode: (val) => String(val),
          encode: (val) => Number(val),
        }),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<Readonly<{ id: number }>, unknown, Readonly<{ id: string }>>
    >();
  });

  it('should correctly infer the output type from a effectTs schema for the handleSubmit function in useForm', () => {
    const schema = Schema.Struct({ id: Schema.Number });

    const form = useForm({
      resolver: effectTsResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<Readonly<{ id: number }>>>();
  });

  it('should correctly infer the output type from a effectTs schema with a transform for the handleSubmit function in useForm', () => {
    const schema = Schema.Struct({
      id: Schema.transform(Schema.Number, Schema.String, {
        decode: (val) => String(val),
        encode: (val) => Number(val),
      }),
    });

    const form = useForm({
      resolver: effectTsResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<Readonly<{ id: string }>>>();
  });
});
