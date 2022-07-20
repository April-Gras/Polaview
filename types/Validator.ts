export type ValidatorFunction<T extends Record<string, unknown>> = (
  obj: T
) => (keyof T)[];
