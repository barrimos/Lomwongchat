const setRateLimit = require('express-rate-limit');
// Rate limit middleware
const rateLimiter = setRateLimit({
  windowMs: 1000 * 60 * 60,
  max: 3,
  message: `You\'ve reached the maximum request limit.\nTry again at ${new Date().getHours() + 1}:${String(new Date().getMinutes()).padStart(2, '0')} hrs`,
  headers: true,
});

module.exports = rateLimiter;
