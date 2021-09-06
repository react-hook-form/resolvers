import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import { ValidatorOptions } from 'class-validator';
import { ClassConstructor } from 'class-transformer';

export type Resolver = <
  T extends { [_: string]: any },
  TFieldValues extends FieldValues,
  TContext,
>(
  schema: ClassConstructor<T>,
  schemaOptions?: ValidatorOptions,
  resolverOptions?: { mode?: 'async' | 'sync' },
) => (
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
