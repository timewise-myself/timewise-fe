import { z } from "zod";

export type FieldErrors<T> = {
  [Key in keyof T]?: string[];
};

export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>;
  error?: string | null;
  data?: TOutput;
};

export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validateData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    const validateResult = schema.safeParse(data);
    if (!validateResult.success) {
      return {
        fieldErrors: validateResult.error.flatten()
          .fieldErrors as FieldErrors<TInput>,
      };
    }
    return handler(validateResult.data);
  };
};
