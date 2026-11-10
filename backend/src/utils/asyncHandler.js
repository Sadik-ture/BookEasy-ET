// Wraps async route handlers so errors go to the Express error handler
export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}