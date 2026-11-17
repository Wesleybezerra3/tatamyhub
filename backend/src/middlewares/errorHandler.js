export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  res.status(status).json({
    error: message,
    details: err.details || null
  });
}
