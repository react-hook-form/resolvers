import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import type { AsyncValidationOptions, Schema } from 'joi';

export type Resolver = <T extends Schema>(
  schema: T,
  schemaOptions?: AsyncValidationOptions,
  resolverOptions?: { mode: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;
