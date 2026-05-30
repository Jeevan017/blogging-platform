const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing environment variable(s): ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.trim()) {
    throw new Error('Missing environment variable: CLIENT_URL (required in production)');
  }
};

export default validateEnv;
