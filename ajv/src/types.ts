import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import * as Ajv from 'ajv';

export type FactoryOptions<T> = {
  mode?: 'async' | 'sync',
  transform?: (data: T) => T,
}

export type Resolver = <T extends FieldValues>(
  schema: Ajv.JSONSchemaType<T>,
  schemaOptions?: Ajv.Options,
  factoryOptions?: FactoryOptions<T>,
) => <TContext>(
  values: T,
  context: TContext | undefined,
  options: ResolverOptions<T>,
) => Promise<ResolverResult<T>>;
