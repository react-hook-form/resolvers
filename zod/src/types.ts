import {
  ResolverResult,
  UnpackNestedValue,
  ResolverOptions,
  FieldValues,
} from 'react-hook-form';
import { z } from 'zod';

export type Resolver = <TFieldValues extends FieldValues, TContext>(
  schema: z.Schema<any, any>,
  schemaOptions?: Partial<z.ParseParamsNoData>,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => (
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
