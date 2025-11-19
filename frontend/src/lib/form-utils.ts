import { z } from 'zod';

/**
 * Extracts field errors from Zod validation result
 */
export function getZodFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError
): Partial<Record<keyof T, string>> {
  const fieldErrors: Partial<Record<keyof T, string>> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && typeof field === 'string') {
      fieldErrors[field as keyof T] = issue.message;
    }
  });

  return fieldErrors;
}
