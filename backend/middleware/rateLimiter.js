import rateLimit from "express-rate-limit";

export const createRateLimiter = (opts = {}) =>
  rateLimit({
    windowMs: opts.windowMs || 15 * 60 * 1000, 
    max: opts.max || 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." }
  });

export const authLimiter = createRateLimiter({ windowMs: 15*60*1000, max: 10 }); 
export const uploadLimiter = createRateLimiter({ windowMs: 60*60*1000, max: 20 }); 