import { renderHook } from '@testing-library/react';
import {
  Effect,
  Schema,
  SchemaGetter,
  SchemaIssue,
  SchemaTransformation,
} from 'effect';
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
        Schema.String.check(
          Schema.isPattern(/^\+\d{7,15}$/, {
            message:
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
        Schema.String.check(
          Schema.isPattern(/^\+\d{7,15}$/, {
            message:
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

  it('should group all messages of the same issue type when `criteriaMode` is "all"', async () => {
    const schema = Schema.Struct({
      password: Schema.String.check(
        Schema.isMinLength(8, { message: 'Too short' }),
        Schema.isPattern(/\d/, { message: 'Needs a number' }),
      ),
    });

    const result = await effectTsResolver(schema)(
      { password: 'abc' },
      undefined,
      { fields, criteriaMode: 'all', shouldUseNativeValidation },
    );

    expect(result.errors.password).toMatchObject({
      message: 'Too short',
      type: 'Filter',
      types: { Filter: ['Too short', 'Needs a number'] },
    });
  });

  it('should return nested and indexed errors with their issue type', async () => {
    const schema = Schema.Struct({
      user: Schema.Struct({ name: Schema.String }),
      tags: Schema.Array(Schema.String),
    });

    const result = await effectTsResolver(schema)(
      { user: {}, tags: ['a', 1] } as any,
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result).toEqual({
      values: {},
      errors: {
        user: { name: { message: 'Missing key', type: 'MissingKey' } },
        tags: [undefined, { message: 'Expected string', type: 'InvalidType' }],
      },
    });
  });

  it('should only report the first error when `schemaOptions.errors` is "first"', async () => {
    const schema = Schema.Struct({ a: Schema.String, b: Schema.String });

    const result = await effectTsResolver(schema, { errors: 'first' })(
      {} as any,
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(Object.keys(result.errors)).toEqual(['a']);
  });

  it('should ignore excess properties by default and report them when `onExcessProperty` is "error"', async () => {
    const schema = Schema.Struct({ a: Schema.String });
    const values = { a: 'a', b: 'b' } as any;

    const ignored = await effectTsResolver(schema)(values, undefined, {
      fields,
      shouldUseNativeValidation,
    });
    expect(ignored).toEqual({ errors: {}, values: { a: 'a' } });

    const rejected = await effectTsResolver(schema, {
      errors: 'all',
      onExcessProperty: 'error',
    })(values, undefined, { fields, shouldUseNativeValidation });
    expect(rejected.errors).toMatchObject({
      b: { type: 'UnexpectedKey' },
    });
  });

  it('should return the decoded output when a transformation is used', async () => {
    const schema = Schema.Struct({ age: Schema.NumberFromString });

    const result = await effectTsResolver(schema)({ age: '42' }, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: { age: 42 } });
  });

  it('should report errors raised by a failing transformation', async () => {
    const schema = Schema.Struct({
      age: Schema.String.pipe(
        Schema.decodeTo(Schema.Number, {
          decode: SchemaGetter.transformEffect((s: string) =>
            Number.isNaN(Number(s))
              ? Effect.fail(
                  new SchemaIssue.InvalidValue({ message: 'Not a number' }),
                )
              : Effect.succeed(Number(s)),
          ),
          encode: SchemaGetter.String(),
        }),
      ),
    });

    const result = await effectTsResolver(schema)({ age: 'abc' }, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({
      values: {},
      errors: { age: { message: 'Not a number', type: 'InvalidValue' } },
    });
  });

  it('should support asynchronous validation', async () => {
    const schema = Schema.Struct({
      username: Schema.String.pipe(
        Schema.decodeTo(Schema.String, {
          decode: SchemaGetter.checkEffect((s: string) =>
            Effect.sleep('1 millis').pipe(
              Effect.as(s === 'taken' ? 'Username is taken' : undefined),
            ),
          ),
          encode: SchemaGetter.passthrough(),
        }),
      ),
    });

    const valid = await effectTsResolver(schema)(
      { username: 'free' },
      undefined,
      { fields, shouldUseNativeValidation },
    );
    expect(valid).toEqual({ errors: {}, values: { username: 'free' } });

    const invalid = await effectTsResolver(schema)(
      { username: 'taken' },
      undefined,
      { fields, shouldUseNativeValidation },
    );
    expect(invalid.errors).toMatchObject({
      username: { message: 'Username is taken' },
    });
  });

  it('should validate fields natively when `shouldUseNativeValidation` is true', async () => {
    const setCustomValidity = vi.fn();
    const reportValidity = vi.fn();
    const nativeFields = {
      username: {
        name: 'username',
        ref: { name: 'username', setCustomValidity, reportValidity },
      },
    } as any;

    const result = await effectTsResolver(
      Schema.Struct({ username: Schema.String }),
    )({ username: 'john' }, undefined, {
      fields: nativeFields,
      names: ['username'],
      shouldUseNativeValidation: true,
    });

    expect(result).toEqual({ errors: {}, values: { username: 'john' } });
    expect(setCustomValidity).toHaveBeenCalledWith('');
    expect(reportValidity).toHaveBeenCalled();
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
        id: Schema.Number.pipe(
          Schema.decodeTo(
            Schema.String,
            SchemaTransformation.transform({
              decode: (val) => String(val),
              encode: (val) => Number(val),
            }),
          ),
        ),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<Readonly<{ id: number }>, unknown, Readonly<{ id: string }>>
    >();
  });

  it('should correctly infer the output type from a effectTs schema for the handleSubmit function in useForm', () => {
    const schema = Schema.Struct({ id: Schema.Number });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: effectTsResolver(schema),
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<Readonly<{ id: number }>>>();
  });

  it('should correctly infer the output type from a effectTs schema with a transform for the handleSubmit function in useForm', () => {
    const schema = Schema.Struct({
      id: Schema.Number.pipe(
        Schema.decodeTo(
          Schema.String,
          SchemaTransformation.transform({
            decode: (val) => String(val),
            encode: (val) => Number(val),
          }),
        ),
      ),
    });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: effectTsResolver(schema),
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<Readonly<{ id: string }>>>();
  });
});
