import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
  ResolverOptions,
} from 'react-hook-form';
import * as z from 'zod';
import type { ParseParams } from 'zod/lib/src/parser';

export type Resolver = <T extends z.ZodSchema<any, any>>(
  schema: T,
  schemaOptions?: ParseParams,
  factoryOptions?: { mode?: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
