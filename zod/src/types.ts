import {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import * as z from 'zod';
import type { ParseParams } from 'zod/lib/src/parser';

export type Resolver = <T extends z.ZodSchema<any, any>>(
  schema: T,
  schemaOptions?: ParseParams,
  resolverOptions?: { mode: 'async' | 'sync' },
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;
