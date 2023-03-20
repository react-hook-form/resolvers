import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';
import * as Yup from 'yup';
import type Lazy from 'yup/lib/Lazy';

type Options<T extends Yup.AnyObjectSchema | Lazy<any>> = Parameters<
  T['validate']
>[1];

export type Resolver = <T extends Yup.AnyObjectSchema | Lazy<any>>(
  schema: T,
  schemaOptions?: Options<T>,
  factoryOptions?: {
    /**
     * @default async
     */
    mode?: 'async' | 'sync';
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
