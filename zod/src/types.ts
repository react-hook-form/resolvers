/* eslint-disable @typescript-eslint/ban-types */
import { ResolverResult, ResolverOptions, FieldValues } from 'react-hook-form';
import { z } from 'zod';

export type Resolver = <
  TFieldValues extends FieldValues,
  TContext extends object = object,
>(
  schema: z.Schema<TFieldValues, any>,
  schemaOptions?: Partial<z.ParseParamsNoData>,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => (
  values: unknown,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
