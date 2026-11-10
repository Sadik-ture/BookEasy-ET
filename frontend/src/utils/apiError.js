// Turns an Axios error into { message, fields }
export function parseApiError(err) {
  const e = err?.response?.data?.error;
  return {
    message: e?.message || "Something went wrong. Please try again.",
    fields: e?.fields || {},
  };
}