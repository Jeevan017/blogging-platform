const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL?.trim();

  if (process.env.NODE_ENV === 'production') {
    return clientUrl ? [clientUrl] : [];
  }

  const developmentOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    clientUrl,
  ].filter(Boolean);

  return [...new Set(developmentOrigins)];
};

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

export default corsOptions;
