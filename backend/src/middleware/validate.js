function toResponse(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "Please review the submitted information.", fields },
  };
}

// Validates req.body
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(toResponse(result.error));
    req.body = result.data;
    next();
  };
}

// Validates req.query, result is available as req.validatedQuery
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return res.status(400).json(toResponse(result.error));
    req.validatedQuery = result.data;
    next();
  };
}