import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import * as Yup from 'yup';

type Options<T extends Yup.AnyObjectSchema> = Parameters<T['validate']>[1];

export type Resolver = <T extends Yup.AnyObjectSchema>(
  schema: T,
  schemaOptions?: Options<T>,
  resolverOptions?: { mode: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;
