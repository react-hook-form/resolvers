import {
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import type { AsyncValidationOptions, Schema } from 'joi';

export type Resolver = <T extends Schema, TFieldValues, TContext>(
  schema: T,
  schemaOptions?: AsyncValidationOptions,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => (
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
