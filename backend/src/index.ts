import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import apiRoutes from './routes/index.js';
import cronService from './services/cronService.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// 初始化 Sentry 错误监控
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1, // 10% 的请求会被追踪性能
    integrations: [
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
    ],
  });
  console.log('✅ Sentry error monitoring initialized');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? [...process.env.CORS_ORIGIN.split(',').map(s => s.trim()), 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all vercel preview URLs and aikidprint domains
    if (origin.includes('vercel.app') || 
        origin.includes('aikidprint.com') || 
        origin.includes('railway.app') ||
        corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 全局 API 限流
app.use('/api', generalLimiter);

// 静态文件服务 - 提供生成的图片
app.use('/generated', express.static(path.join(__dirname, '../public/generated')));

// 静态文件服务 - 提供上传/统一图片（允许跨域）
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../public/uploads')));

// 静态文件服务 - 预览图
app.use('/previews', express.static(path.join(__dirname, '../public/previews')));

// 静态文件服务 - 提供图片资源
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// 静态文件服务 - 提供字体文件（允许跨域，便于 Puppeteer 本地加载）
app.use('/fonts', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../public/fonts')));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sentry 测试端点（仅用于验证 Sentry 是否正常工作）
app.get('/api/debug-sentry', (req, res) => {
  const testError = new Error('Sentry test error - this is intentional!');
  Sentry.captureException(testError);
  res.json({ 
    success: true, 
    message: 'Test error sent to Sentry',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // 发送错误到 Sentry
  Sentry.captureException(err);
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize cron jobs
cronService.initializeWeeklyDelivery();

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📅 Weekly delivery cron job initialized`);
});
