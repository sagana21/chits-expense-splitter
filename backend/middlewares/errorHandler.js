export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;
  let message = err.type === 'entity.parse.failed' ? 'Request body is not valid JSON' : err.message || 'Something went wrong';

  if (err.name === 'CastError') {
    status = 404;
    message = 'That item was not found';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.code === 11000) {
    status = 400;
    message = 'That email is already registered';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
};
