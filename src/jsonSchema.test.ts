import { JSONSchema, jsonSchemaResolver } from './jsonSchema';

const syncSchema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      pattern: '[a-zA-Z]',
      minLength: 3,
    },
    age: {
      type: 'integer',
      minimum: 0,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    hobbies: {
      type: 'array',
      minItems: 1,
      items: {
        properties: {
          description: {
            type: 'string',
            minLength: 3,
          },
        },
        required: ['description'],
      },
    },
  },
  required: ['name', 'age', 'email', 'hobbies'],
};

const asyncSchema: JSONSchema = {
  ...syncSchema,
  $async: true,
};

describe('ajvResolver', () => {
  describe('sync', () => {
    it('should get values when there is no error', async () => {
      const data = {
        name: 'jimmy',
        age: 24,
        email: 'jimmy@jimmy.com',
        hobbies: [
          {
            description: 'tennis',
          },
        ],
      };
      expect(await jsonSchemaResolver(syncSchema)(data)).toEqual({
        values: data,
        errors: {},
      });
    });

    it('should get errors on invalid data', async () => {
      const data = {
        name: 'jimmy',
        age: '24',
        email: 'jimmy@jimmy.com',
        hobbies: [
          {
            description: 'tennis',
          },
          {
            description: 'ab',
          },
        ],
      };

      expect(await jsonSchemaResolver(syncSchema)(data)).toMatchSnapshot();
    });

    it('should throw when an invalid schema object is provided', async () => {
      expect(() => {
        jsonSchemaResolver({
          ...syncSchema,
          type: 'o' as any,
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('should throw when an invalid schema param is provided to ajv', async () => {
      expect(() => {
        jsonSchemaResolver(jsonSchemaResolver as any);
      }).toThrowErrorMatchingSnapshot();
    });
  });
  describe('async', () => {
    it('should get values when there is no error', async () => {
      const data = {
        name: 'jimmy',
        age: 24,
        email: 'jimmy@jimmy.com',
        hobbies: [
          {
            description: 'tennis',
          },
        ],
      };
      expect(await jsonSchemaResolver(asyncSchema)(data)).toEqual({
        values: data,
        errors: {},
      });
    });

    it('should get errors on invalid data', async () => {
      const data = {
        name: 'jimmy',
        age: '24',
        email: 'jimmy@jimmy.com',
        hobbies: [
          {
            description: 'tennis',
          },
          {
            description: 'ab',
          },
        ],
      };

      expect(
        await jsonSchemaResolver(asyncSchema, { ajvOptions: {} })(
          data,
          undefined,
          true,
        ),
      ).toMatchSnapshot();
    });

    it('should throw when an invalid schema object is provided', async () => {
      expect(() => {
        jsonSchemaResolver(
          {
            ...syncSchema,
            type: 'o' as any,
          },
          {},
        );
      }).toThrowErrorMatchingSnapshot();
    });

    it('should throw when an invalid schema param is provided to ajv', async () => {
      expect(() => {
        jsonSchemaResolver(jsonSchemaResolver as any, {
          ajvOptions: { async: true },
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
