import {
  FieldName,
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import type { Suite } from 'vest';

export type ICreateResult<
  TValues extends FieldValues = FieldValues,
  TContext = any,
> = Suite<
  any,
  any,
  (values: TValues, names?: FieldName<TValues>[], context?: TContext) => void
>;

export type Resolver = <TValues extends FieldValues, TContext>(
  schema: ICreateResult<TValues, TContext>,
  schemaOptions?: never,
  factoryOptions?: { mode?: 'async' | 'sync'; rawValues?: boolean },
) => (
  values: TValues,
  context: TContext | undefined,
  options: ResolverOptions<TValues>,
) => Promise<ResolverResult<TValues>>;

export type VestErrors = Record<string, string[]>;
