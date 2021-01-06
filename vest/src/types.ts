import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import * as Vest from 'vest';

export type ICreateResult = ReturnType<typeof Vest.create>;

export type Resolver = (
  schema: ICreateResult,
  options?: any,
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;

export type VestErrors = Record<string, string[]>;

export type Promisify = <T extends ICreateResult, K>(
  fn: T,
) => (args: K) => Promise<Vest.IVestResult>;
