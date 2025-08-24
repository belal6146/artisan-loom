export function friendlyError(e: unknown): string {
  if (typeof e === "string") return e;
  
  const msg = (e as any)?.message ?? "Something went wrong";
  
  // Handle common error types
  if (/ZodError/i.test(msg)) return "Please check the form inputs.";
  if (/NetworkError/i.test(msg)) return "Network connection failed. Please try again.";
  if (/Unauthorized/i.test(msg)) return "Please log in to continue.";
  if (/Forbidden/i.test(msg)) return "You don't have permission to do that.";
  if (/Not Found/i.test(msg)) return "The requested resource was not found.";
  
  return msg;
}

export function logError(context: string, error: unknown, extra?: Record<string, any>) {
  console.error(`[${context}]`, {
    message: friendlyError(error),
    error,
    ...extra,
  });
}