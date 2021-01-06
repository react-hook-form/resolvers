import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import { validate, Struct } from 'superstruct';

type Options = Parameters<typeof validate>[2];

export type Resolver = <T extends Struct<any, any>>(
  schema: T,
  options?: Options,
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;
