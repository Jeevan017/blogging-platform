const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const { method, originalUrl } = req;
    const { statusCode } = res;

    if (process.env.NODE_ENV === 'production') {
      if (statusCode >= 400) {
        console.error(`[${method}] ${originalUrl} ${statusCode}`);
      }
      return;
    }

    const duration = Date.now() - start;
    console.log(`[${method}] ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
};

export default requestLogger;
