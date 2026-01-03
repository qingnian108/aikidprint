/**
 * API 限流中间件
 * 防止恶意脚本刷爆 API 额度
 */

import rateLimit from 'express-rate-limit';

// 通用 API 限流：每 IP 每分钟 60 次请求
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 生成接口限流：每 IP 每分钟最多 10 次（消耗 Gemini API）
export const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10,
  message: {
    success: false,
    error: 'Generation limit reached. Please wait a moment before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Weekly Pack 生成限流：每 IP 每分钟最多 3 次（生成多页，消耗更多资源）
export const weeklyPackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Weekly pack generation limit reached. Please wait before generating another pack.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录接口限流：防止暴力破解，每 IP 每 15 分钟最多 10 次
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin API 限流：每 IP 每分钟 30 次
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Admin API rate limit exceeded',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  generalLimiter,
  generateLimiter,
  weeklyPackLimiter,
  loginLimiter,
  adminLimiter,
};
