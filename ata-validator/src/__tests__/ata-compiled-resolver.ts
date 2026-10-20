import { toStandaloneModule } from 'ata-validator/build';
import { ataCompiledResolver, ataResolver } from '..';
import type { AtaCompiledValidator } from '..';
import {
  fields,
  invalidData,
  invalidDataWithUndefined,
  schema,
  validData,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

// The module `ata compile --order` writes, loaded from its source.
const compile = (s: object): AtaCompiledValidator => {
  const source = toStandaloneModule(s, { format: 'cjs', order: true });
  if (!source) {
    throw new Error('schema did not compile');
  }
  const module = { exports: {} as AtaCompiledValidator };
  new Function('module', 'exports', source)(module, module.exports);
  return module.exports;
};

const compiled = compile(schema);

// A form whose fields share a definition and carry defaults.
const addressSchema = {
  type: 'object',
  $defs: {
    address: {
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 3 },
        zip: { type: 'string', pattern: '^[0-9]{5}$', minLength: 5 },
        country: { type: 'string', enum: ['TR', 'DE', 'US'], default: 'TR' },
      },
      required: ['street', 'zip'],
    },
  },
  properties: {
    home: { $ref: '#/$defs/address' },
    work: { $ref: '#/$defs/address' },
    newsletter: { type: 'boolean', default: false },
  },
  required: ['home'],
};

describe('ataCompiledResolver', () => {
  const cases: [string, object, 'all' | undefined][] = [
    ['valid data', validData, undefined],
    ['invalid data, first error', invalidData, undefined],
    ['invalid data, every error', invalidData, 'all'],
    ['an empty object', {}, undefined],
    ['undefined properties', invalidDataWithUndefined, undefined],
  ];

  for (const [name, data, criteriaMode] of cases) {
    it(`answers as ataResolver for ${name}`, async () => {
      const options = { fields, criteriaMode, shouldUseNativeValidation };
      expect(
        await ataCompiledResolver(compiled)(
          structuredClone(data),
          undefined,
          options,
        ),
      ).toEqual(
        await ataResolver(schema)(structuredClone(data), undefined, options),
      );
    });
  }

  it('returns a copy of the values with raw=true', async () => {
    const result = await ataCompiledResolver(compiled, { raw: true })(
      validData,
      undefined,
      { fields, shouldUseNativeValidation },
    );

    expect(result).toEqual({ errors: {}, values: validData });
    expect(result.values).not.toBe(validData);
  });

  it('fills defaults and orders errors behind a shared definition as ataResolver does', async () => {
    const module = compile(addressSchema);
    expect(typeof module.applyDefaults).toBe('function');

    const documents = [
      { home: { street: 'Bagdat', zip: '34710' } },
      { home: { street: 'ab', zip: '12a' }, work: { zip: '1' } },
      { work: { street: 'Levent', zip: 'abcde', country: 'FR' } },
    ];
    for (const data of documents) {
      for (const criteriaMode of [undefined, 'all'] as const) {
        const options = { fields, criteriaMode, shouldUseNativeValidation };
        expect(
          await ataCompiledResolver(module)(
            structuredClone(data),
            undefined,
            options,
          ),
        ).toEqual(
          await ataResolver(addressSchema)(
            structuredClone(data),
            undefined,
            options,
          ),
        );
      }
    }

    // Defaults are filled where ataResolver fills them.
    const data = { home: { street: 'Bagdat', zip: '34710' } };
    const options = { fields, shouldUseNativeValidation };
    const filled = await ataCompiledResolver(module)(
      structuredClone(data),
      undefined,
      options,
    );
    expect(filled.values).toEqual(
      (
        await ataResolver(addressSchema)(
          structuredClone(data),
          undefined,
          options,
        )
      ).values,
    );
    expect(filled.values).toMatchObject({ newsletter: false });
  });
});
