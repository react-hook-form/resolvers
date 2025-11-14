import { Type } from '@sinclair/typebox';
import { elysiaTypeboxResolver } from '../elysia-typebox';

describe('elysiaTypeboxResolver - Optional Fields', () => {
  it('should handle optional fields with undefined values', async () => {
    const schema = Type.Object({
      name: Type.String(),
      birthday: Type.Optional(Type.Date()),
      bio: Type.Optional(Type.String()),
    });

    const resolver = elysiaTypeboxResolver(schema);

    const result = await resolver(
      { name: 'John', birthday: undefined, bio: undefined },
      {},
      { fields: {}, shouldUseNativeValidation: false, criteriaMode: 'all' },
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({ name: 'John' });
  });

  it('should handle optional fields that are omitted', async () => {
    const schema = Type.Object({
      name: Type.String(),
      birthday: Type.Optional(Type.Date()),
      bio: Type.Optional(Type.String()),
    });

    const resolver = elysiaTypeboxResolver(schema);

    const result = await resolver(
      { name: 'John' },
      {},
      { fields: {}, shouldUseNativeValidation: false, criteriaMode: 'all' },
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({ name: 'John' });
  });

  it('should handle mix of undefined and omitted optional fields', async () => {
    const schema = Type.Object({
      required: Type.String(),
      optional1: Type.Optional(Type.Number()),
      optional2: Type.Optional(Type.String()),
      optional3: Type.Optional(Type.Date()),
    });

    const resolver = elysiaTypeboxResolver(schema);

    const result = await resolver(
      {
        required: 'test',
        optional1: undefined,
        optional2: 'value',
        // optional3 is omitted
      },
      {},
      { fields: {}, shouldUseNativeValidation: false, criteriaMode: 'all' },
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      required: 'test',
      optional2: 'value',
    });
  });

  it('should validate required fields even when optional fields are undefined', async () => {
    const schema = Type.Object({
      required: Type.String({ minLength: 3 }),
      optional: Type.Optional(Type.Date()),
    });

    const resolver = elysiaTypeboxResolver(schema);

    const result = await resolver(
      {
        required: 'ab', // Too short
        optional: undefined,
      },
      {},
      { fields: {}, shouldUseNativeValidation: false, criteriaMode: 'all' },
    );

    expect(result.errors).toHaveProperty('required');
    expect((result.errors as any).required?.message).toContain(
      'Expected string length greater or equal to 3',
    );
  });

  it('should handle all optional fields being undefined', async () => {
    const schema = Type.Object({
      field1: Type.Optional(Type.String()),
      field2: Type.Optional(Type.Number()),
      field3: Type.Optional(Type.Date()),
    });

    const resolver = elysiaTypeboxResolver(schema);

    const result = await resolver(
      {
        field1: undefined,
        field2: undefined,
        field3: undefined,
      },
      {},
      { fields: {}, shouldUseNativeValidation: false, criteriaMode: 'all' },
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({});
  });
});
