import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import * as Vest from 'vest';

export type ICreateResult = ReturnType<typeof Vest.create>;

export type Resolver = (
  schema: ICreateResult,
  schemaOptions?: never,
  factoryOptions?: { mode?: 'async' | 'sync', rawValues?: boolean; },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;

export type VestErrors = Record<string, string[]>;
