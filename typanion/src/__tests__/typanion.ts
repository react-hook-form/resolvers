import { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Resolver } from 'react-hook-form';
import * as t from 'typanion';
import { typanionResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const tmpObj = {
  validate: schema,
};

const shouldUseNativeValidation = false;

describe('typanionResolver', () => {
  it('should return values from typanionResolver when validation pass', async () => {
    const schemaSpy = vi.spyOn(tmpObj, 'validate');

    const result = await typanionResolver(schemaSpy as any)(
      validData,
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );

    expect(schemaSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from typanionResolver when validation fails', async () => {
    const result = await typanionResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a typanion schema', () => {
    const resolver = typanionResolver(t.isObject({ id: t.isNumber() }));

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<ObjectType<{ id: number }>, unknown, ObjectType<{ id: number }>>
    >();
  });

  it('should correctly infer the output type from a typanion schema for the handleSubmit function in useForm', () => {
    const schema = t.isObject({ id: t.isNumber() });

    const form = useForm({
      resolver: typanionResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number>();

    expectTypeOf(form.handleSubmit)
      .parameter(0)
      .toEqualTypeOf<SubmitHandler<ObjectType<{ id: number }>>>();
  });
});

/**
 * Copied from Typanion source code because it's not exported
 */

declare type ExtractIndex<T> = {
  // biome-ignore lint/complexity/noBannedTypes: for testing purposes
  [K in keyof T as {} extends Record<K, 1> ? K : never]: T[K];
};
declare type RemoveIndex<T> = {
  // biome-ignore lint/complexity/noBannedTypes: for testing purposes
  [K in keyof T as {} extends Record<K, 1> ? never : K]: T[K];
};
declare type UndefinedProperties<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];
declare type UndefinedToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
  Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;
declare type ObjectType<T> = UndefinedToOptional<RemoveIndex<T>> &
  ExtractIndex<T>;
