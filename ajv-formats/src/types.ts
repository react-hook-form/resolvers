import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import * as Ajv from 'ajv';

export type Resolver = <T>(
  schema: Ajv.JSONSchemaType<T>,
  schemaOptions?: Ajv.Options,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
