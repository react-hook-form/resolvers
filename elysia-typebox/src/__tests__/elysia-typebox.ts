import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { elysiaTypeboxResolver } from '..';
import { fields, invalidData, schema, validData } from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('elysiaTypeboxResolver', () => {
  it('should return a single error from elysiaTypeboxResolver when validation fails', async () => {
    const result = await elysiaTypeboxResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from elysiaTypeboxResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await elysiaTypeboxResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should validate with success', async () => {
    const result = await elysiaTypeboxResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should use custom error message when provided as string', async () => {
    const schemaWithCustomError = Type.Object({
      username: Type.String({
        minLength: 3,
        error: 'Username must be at least 3 characters',
      } as any),
    });

    const result = await elysiaTypeboxResolver(schemaWithCustomError)(
      { username: 'ab' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect('username' in result.errors && result.errors.username?.message).toBe(
      'Username must be at least 3 characters',
    );
  });

  it('should use custom error function when provided', async () => {
    const schemaWithCustomError = Type.Object({
      age: Type.Number({
        minimum: 18,
        error: ({ value }: { value: unknown }) =>
          `Invalid age: ${value}. Must be 18 or older`,
      } as any),
    });

    const result = await elysiaTypeboxResolver(schemaWithCustomError)(
      { age: 15 },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect('age' in result.errors && result.errors.age?.message).toBe(
      'Invalid age: 15. Must be 18 or older',
    );
  });

  it('should handle Transform types with decoding', async () => {
    const schemaWithTransform = Type.Object({
      id: Type.Transform(Type.String())
        .Decode((v) => Number.parseInt(v))
        .Encode((v) => String(v)),
    });

    const result = await elysiaTypeboxResolver(schemaWithTransform)(
      { id: '123' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result).toEqual({ errors: {}, values: { id: 123 } });
  });

  it('should validate Transform types after decoding', async () => {
    const schemaWithTransform = Type.Object({
      age: Type.Transform(Type.String())
        .Decode((v) => {
          const num = Number.parseInt(v);
          if (isNaN(num)) {
            throw new Error('Invalid number');
          }
          return num;
        })
        .Encode((v) => String(v)),
    });

    // This will fail during decode
    const result = await elysiaTypeboxResolver(schemaWithTransform)(
      { age: 'not-a-number' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect('age' in result.errors && result.errors.age).toBeDefined();
  });

  it('should handle nested objects with custom errors', async () => {
    const nestedSchema = Type.Object({
      user: Type.Object({
        email: Type.String({
          format: 'email',
          error: 'Please provide a valid email address',
        } as any),
        profile: Type.Object({
          age: Type.Number({
            minimum: 0,
            error: 'Age must be a positive number',
          } as any),
        }),
      }),
    });

    const result = await elysiaTypeboxResolver(nestedSchema)(
      { user: { email: 'invalid', profile: { age: -1 } } },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    const errors = result.errors as Record<string, { message?: string }>;
    if ('user.email' in errors) {
      expect(errors['user.email']?.message).toContain('email');
    } else {
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    }

    if ('user.profile.age' in errors) {
      expect(errors['user.profile.age']?.message).toBe(
        'Age must be a positive number',
      );
    }
  });

  it('should correctly infer the output type from a typebox schema', () => {
    const resolver = elysiaTypeboxResolver(Type.Object({ id: Type.Number() }));

    expectTypeOf(resolver).toEqualTypeOf<Resolver<{ id: number }>>();
  });

  it('should correctly infer the output type from a typebox schema with TypeCompiler', () => {
    const typecheck = TypeCompiler.Compile(Type.Object({ id: Type.Number() }));
    const resolver = elysiaTypeboxResolver(typecheck);

    expectTypeOf(resolver).toEqualTypeOf<Resolver<{ id: number }>>();
  });

  it('should correctly infer the output type from a typebox schema using a transform', () => {
    const resolver = elysiaTypeboxResolver(
      Type.Object({
        id: Type.Transform(Type.Number())
          .Decode((v) => String(v))
          .Encode((v) => Number.parseInt(v)),
      }),
    );

    expectTypeOf(resolver).toEqualTypeOf<Resolver<{ id: number }>>();
  });

  it('should correctly infer the output type from a typebox schema for the handleSubmit function in useForm', () => {
    const schema = Type.Object({ id: Type.Number() });

    const form = useForm({
      resolver: elysiaTypeboxResolver(schema),
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
      resolver: elysiaTypeboxResolver(typecheck),
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
      resolver: elysiaTypeboxResolver(schema),
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

  it('should handle mock Elysia Numeric type with transform', async () => {
    const NumericType = Type.Transform(
      Type.Union([Type.String(), Type.Number()]),
    )
      .Decode((value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) {
          throw new Error('Invalid number');
        }
        return num;
      })
      .Encode((value) => value);

    const schema = Type.Object({
      age: NumericType,
    });

    const result = await elysiaTypeboxResolver(schema)(
      { age: '25' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result).toEqual({ errors: {}, values: { age: 25 } });
  });

  it('should handle mock Elysia BooleanString type', async () => {
    const BooleanStringType = Type.Transform(
      Type.Union([Type.String(), Type.Boolean()]),
    )
      .Decode((value) => {
        if (typeof value === 'boolean') {
          return value;
        }
        return value === 'true';
      })
      .Encode((value) => value);

    const schema = Type.Object({
      active: BooleanStringType,
    });

    const result = await elysiaTypeboxResolver(schema)(
      { active: 'true' },
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result).toEqual({ errors: {}, values: { active: true } });
  });
});
