import vine from '@vinejs/vine';
import { Resolver, useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form';
import { vineResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('vineResolver', () => {
  it('should return values from vineResolver when validation pass', async () => {
    const schemaSpy = vi.spyOn(schema, 'validate');

    const result = await vineResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(schemaSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from vineResolver when validation fails', async () => {
    const result = await vineResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from vineResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await vineResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return values from vineResolver when validation pass & raw=true', async () => {
    const schemaSpy = vi.spyOn(schema, 'validate');

    const result = await vineResolver(schema, undefined, { raw: true })(
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

  /**
   * Type inference tests
   */
  it('should correctly infer the output type from a vine schema', () => {
    const resolver = vineResolver(
      vine.compile(vine.object({ id: vine.number() })),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number | string }, unknown, { id: number }>
    >();
  });

  it('should correctly infer the output type from a vine schema using a transform', () => {
    const resolver = vineResolver(
      vine.compile(
        vine.object({
          id: vine
            .number()
            .decimal([2, 4])
            .transform<string>((val: unknown) => String(val)),
        }),
      ),
    );

    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<{ id: number | string }, unknown, { id: string }>
    >();
  });

  it('should correctly infer the output type from a vine schema for the handleSubmit function in useForm', () => {
    const schema = vine.compile(vine.object({ id: vine.number() }));

    const form = useForm({
      resolver: vineResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<number | string>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: number;
      }>
    >();
  });

  it('should correctly infer the output type from a vine schema with a transform for the handleSubmit function in useForm', () => {
    const schema = vine.compile(
      vine.object({
        id: vine.number().transform<string>((val: unknown) => String(val)),
      }),
    );

    const form = useForm({
      resolver: vineResolver(schema),
    });

    expectTypeOf(form.watch('id')).toEqualTypeOf<string | number>();

    expectTypeOf(form.handleSubmit).parameter(0).toEqualTypeOf<
      SubmitHandler<{
        id: string;
      }>
    >();
  });
});
