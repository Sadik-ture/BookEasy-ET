// Validates req.body against a Zod schema and returns field-level errors
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fields[key]) fields[key] = issue.message;
      }
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Please review the submitted information.", fields },
      });
    }
    req.body = result.data;
    next();
  };
}