import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import * as Vest from 'vest';

export type ICreateResult = ReturnType<typeof Vest.create>;

export type Resolver = (
  schema: ICreateResult,
  schemaOptions?: never,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;

export type VestErrors = Record<string, string[]>;
