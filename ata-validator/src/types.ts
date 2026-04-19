import type { ValidationError, ValidatorOptions } from 'ata-validator';
import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

export type Resolver = (
  schema: object,
  schemaOptions?: ValidatorOptions,
  resolverOptions?: {
    raw?: boolean;
  },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;

export type AtaValidationError = ValidationError;
