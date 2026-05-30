import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again in a minute.',
  },
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many authentication attempts. Please try again in a minute.',
    });
  },
});
