import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import { ValidationState, AnyStrictValidator} from 'typanion'

type ValidateOptions = Pick<ValidationState, 'coercions' | 'coercion'>

type RHFResolver = <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;

export type Resolver = <UnknownValidator extends AnyStrictValidator>(
  validator: UnknownValidator,
  validatorOptions?: ValidateOptions,
)=> RHFResolver
