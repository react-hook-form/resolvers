/* eslint-disable @typescript-eslint/ban-types */
import { ResolverOptions, ResolverResult } from 'react-hook-form';
import * as Yup from 'yup';
import type Lazy from 'yup/lib/Lazy';

type Options<T extends Yup.AnyObjectSchema | Lazy<any>> = Parameters<
  T['validate']
>[1];

export type Resolver = <
  T extends Yup.AnyObjectSchema | Lazy<any>,
  TContext extends object = object,
>(
  schema: T,
  schemaOptions?: Options<T>,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => (
  values: unknown,
  context: TContext | undefined,
  options: ResolverOptions<Yup.InferType<T>>,
) => Promise<ResolverResult<Yup.InferType<T>>>;
