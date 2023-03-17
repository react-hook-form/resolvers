import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';
import * as Yup from 'yup';

type Options<T extends Yup.ObjectSchema<any>> = Parameters<T['validate']>[1];

export type Resolver = <T extends Yup.ObjectSchema<any>>(
  schema: T,
  schemaOptions?: Options<T>,
  factoryOptions?: { mode?: 'async' | 'sync'; rawValues?: boolean },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
