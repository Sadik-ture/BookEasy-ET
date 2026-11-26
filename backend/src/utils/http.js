export const fail = (res, status, code, message, fields) =>
  res.status(status).json({
    success: false,
    error: { code, message, ...(fields ? { fields } : {}) },
  });
