import {
  ResolverResult,
  UnpackNestedValue,
  ResolverOptions,
} from 'react-hook-form';
import { z } from 'zod';

export type Resolver = <T extends z.Schema<any, any>, TFieldValues, TContext>(
  schema: T,
  schemaOptions?: Partial<z.ParseParamsNoData>,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => (
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
