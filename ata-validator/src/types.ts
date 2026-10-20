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

/** A module written by `ata compile --order`: its validate(), and applyDefaults() where the schema declares a default. */
export interface AtaCompiledValidator {
  validate(data: unknown): {
    valid: boolean;
    errors: readonly ValidationError[];
  };
  applyDefaults?(data: unknown): void;
}

export type CompiledResolver = (
  compiled: AtaCompiledValidator,
  resolverOptions?: {
    raw?: boolean;
  },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
