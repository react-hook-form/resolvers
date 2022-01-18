/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import * as yup from 'yup';
import { yupResolver } from '..';
import {
  schema,
  validData,
  fields,
  invalidData,
  schemaWithWhen,
} from './__fixtures__/data';

const shouldUseNativeValidation = false;

describe('yupResolver', () => {
  it('should return values from yupResolver when validation pass', async () => {
    const schemaSpy = jest.spyOn(schema, 'validate');
    const schemaSyncSpy = jest.spyOn(schema, 'validateSync');

    const result = await yupResolver(schema)(validData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(schemaSpy).toHaveBeenCalledTimes(1);
    expect(schemaSyncSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return values from yupResolver with `mode: sync` when validation pass', async () => {
    const validateSyncSpy = jest.spyOn(schema, 'validateSync');
    const validateSpy = jest.spyOn(schema, 'validate');

    const result = await yupResolver(schema, undefined, {
      mode: 'sync',
    })(validData, undefined, { fields, shouldUseNativeValidation });

    expect(validateSyncSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from yupResolver when validation fails', async () => {
    const result = await yupResolver(schema)(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return a single error from yupResolver with `mode: sync` when validation fails', async () => {
    const validateSyncSpy = jest.spyOn(schema, 'validateSync');
    const validateSpy = jest.spyOn(schema, 'validate');

    const result = await yupResolver(schema, undefined, {
      mode: 'sync',
    })(invalidData, undefined, { fields, shouldUseNativeValidation });

    expect(validateSyncSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).not.toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from yupResolver when validation fails with `validateAllFieldCriteria` set to true', async () => {
    const result = await yupResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from yupResolver when validation fails with `validateAllFieldCriteria` set to true and `mode: sync`', async () => {
    const result = await yupResolver(schema, undefined, { mode: 'sync' })(
      invalidData,
      undefined,
      {
        fields,
        criteriaMode: 'all',
        shouldUseNativeValidation,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('should return an error from yupResolver when validation fails and pass down the yup context', async () => {
    const data = { name: 'eric' };
    const context = { min: true };
    const schemaWithContext = yup.object({
      name: yup
        .string()
        .required()
        .when('$min', (min: boolean, schema: yup.StringSchema) => {
          return min ? schema.min(6) : schema;
        }),
    });

    const validateSpy = jest.spyOn(schemaWithContext, 'validate');

    const result = await yupResolver(schemaWithContext)(data, context, {
      fields,
      shouldUseNativeValidation,
    });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).toHaveBeenCalledWith(
      data,
      expect.objectContaining({
        abortEarly: false,
        context,
      }),
    );
    expect(result).toMatchSnapshot();
  });

  it('should show a warning log if yup context is used instead only on dev environment', async () => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn);
    process.env.NODE_ENV = 'development';

    await yupResolver(yup.object(), { context: { noContext: true } })(
      {},
      undefined,
      {
        fields,
        shouldUseNativeValidation,
      },
    );
    expect(console.warn).toHaveBeenCalledWith(
      "You should not used the yup options context. Please, use the 'useForm' context object instead",
    );
    process.env.NODE_ENV = 'test';
  });

  it('should not show a warning log if yup context is used instead only on production environment', async () => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn);
    process.env.NODE_ENV = 'production';

    await yupResolver(yup.object(), { context: { noContext: true } })(
      {},
      undefined,
      { fields, shouldUseNativeValidation },
    );
    expect(console.warn).not.toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('should return correct error message with using yup.test', async () => {
    const result = await yupResolver(
      yup
        .object({
          name: yup.string(),
          email: yup.string(),
        })
        .test(
          'name',
          'Email or name are required',
          (value) => !!(value && (value.name || value.email)),
        ),
    )({ name: '', email: '' }, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(result).toMatchSnapshot();
  });

  it("should merge default yup resolver options with yup's options", async () => {
    const validateSpy = jest.spyOn(schema, 'validate');

    await yupResolver(schema, { stripUnknown: true })(invalidData, undefined, {
      fields,
      shouldUseNativeValidation,
    });

    expect(validateSpy.mock.calls[0][1]).toEqual(
      expect.objectContaining({ stripUnknown: true, abortEarly: false }),
    );
  });

  it('should throw an error without inner property', (done) => {
    yupResolver(schemaWithWhen)({ name: 'test', value: '' }, undefined, {
      fields,
      shouldUseNativeValidation,
    }).catch((e) => {
      expect(e).toMatchInlineSnapshot(
        `[TypeError: You cannot \`concat()\` schema's of different types: string and number]`,
      );
      done();
    });
  });
});
