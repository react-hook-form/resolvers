import { renderHook } from '@testing-library/react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { Type } from 'typebox';
import { Compile } from 'typebox/compile';
import { typeboxResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('typeboxResolver', () => {
  it('should return a single error from typeboxResolver when validation fails', async () => {
    const result = await typeboxResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from typeboxResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await typeboxResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should validate with success', async () => {
    const result = await typeboxResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a typebox schema', () => {
    const resolver = typeboxResolver(Type.Object({ id: Type.Number() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a typebox schema with Compile', () => {
    const typecheck = Compile(Type.Object({ id: Type.Number() }));
    const resolver = typeboxResolver(typecheck);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a typebox schema with Compile and a reference', () => {
    const typecheck = Compile(
      { Name: Type.String() },
      Type.Object({ name: Type.Ref('Name') }),
    );
    const resolver = typeboxResolver(typecheck);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ name: string }, unknown, { name: string }>
    >();
  });

  it('should correctly infer the output type from a typebox schema with Compile and a reference using a transform', () => {
    const typecheck = Compile(
      {
        Id: Type.Codec(Type.Number())
          .Decode((v) => String(v))
          .Encode((v) => Number.parseInt(v)),
      },
      Type.Object({ id: Type.Ref('Id') }),
    );
    const resolver = typeboxResolver(typecheck);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a typebox schema using a transform', () => {
    const resolver = typeboxResolver(
      Type.Object({
        id: Type.Codec(Type.Number())
          .Decode((v) => String(v))
          .Encode((v) => Number.parseInt(v)),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a typebox schema for the handleSubmit function in useForm', () => {
    const schema = Type.Object({ id: Type.Number() });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: typeboxResolver(schema),
        defaultValues: {
          id: 3,
        },
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a typebox schema with Compile for the handleSubmit function in useForm', () => {
    const typecheck = Compile(Type.Object({ id: Type.Number() }));

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: typeboxResolver(typecheck),
        defaultValues: {
          id: 3,
        },
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a typebox schema with a transform for the handleSubmit function in useForm', () => {
    const schema = Type.Object({
      id: Type.Codec(Type.Number())
        .Decode((v) => String(v))
        .Encode((v) => Number.parseInt(v)),
    });

    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        resolver: typeboxResolver(schema),
        defaultValues: {
          id: 3,
        },
      }),
    );

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
