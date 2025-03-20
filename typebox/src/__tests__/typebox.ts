import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { typeboxResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';
import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

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

  it('should correctly infer the output type from a typebox schema with TypeCompiler', () => {
    const typecheck = TypeCompiler.Compile(Type.Object({ id: Type.Number() }));
    const resolver = typeboxResolver(typecheck);

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a typebox schema using a transform', () => {
    const resolver = typeboxResolver(
      Type.Object({
        id: Type.Transform(Type.Number())
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

    const form = useForm({
      resolver: typeboxResolver(schema),
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

  it('should correctly infer the output type from a typebox schema with TypeCompiler for the handleSubmit function in useForm', () => {
    const typecheck = TypeCompiler.Compile(Type.Object({ id: Type.Number() }));

    const form = useForm({
      resolver: typeboxResolver(typecheck),
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

  it('should correctly infer the output type from a typebox schema with a transform for the handleSubmit function in useForm', () => {
    const schema = Type.Object({
      id: Type.Transform(Type.Number())
        .Decode((v) => String(v))
        .Encode((v) => Number.parseInt(v)),
    });

    const form = useForm({
      resolver: typeboxResolver(schema),
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
