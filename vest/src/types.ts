import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import * as Vest from 'vest';

export type ICreateResult = ReturnType<typeof Vest.create>;

export type Resolver = (
  schema: ICreateResult,
  schemaOptions?: never,
  resolverOptions?: { mode: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;

export type VestErrors = Record<string, string[]>;
