import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT 密钥（从环境变量获取）
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'aikidprint-admin-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// 管理员白名单（从环境变量获取，格式：email1:hashedPassword1,email2:hashedPassword2）
// 或者使用简单格式：email1,email2（密码统一使用 ADMIN_PASSWORD）
const getAdminList = (): Map<string, string> => {
  const adminMap = new Map<string, string>();
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // 为每个管理员邮箱设置相同的密码哈希
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  adminEmails.forEach(email => {
    if (email) {
      adminMap.set(email.toLowerCase(), passwordHash);
    }
  });
  
  // 默认管理员（如果没有配置）
  if (adminMap.size === 0) {
    adminMap.set('admin@aikidprint.com', bcrypt.hashSync('admin123', 10));
  }
  
  return adminMap;
};

// 扩展 Request 类型
export interface AdminRequest extends Request {
  admin?: {
    email: string;
    role: string;
  };
}

/**
 * 验证管理员凭据
 */
export const validateAdminCredentials = async (
  email: string,
  password: string
): Promise<{ valid: boolean; role?: string }> => {
  const adminList = getAdminList();
  const normalizedEmail = email.toLowerCase();
  
  if (!adminList.has(normalizedEmail)) {
    return { valid: false };
  }
  
  const storedHash = adminList.get(normalizedEmail)!;
  const isValid = await bcrypt.compare(password, storedHash);
  
  if (isValid) {
    // 第一个管理员是超级管理员
    const adminEmails = Array.from(adminList.keys());
    const role = adminEmails[0] === normalizedEmail ? 'super_admin' : 'admin';
    return { valid: true, role };
  }
  
  return { valid: false };
};

/**
 * 生成管理员 JWT Token
 */
export const generateAdminToken = (email: string, role: string): string => {
  return jwt.sign(
    { email, role, type: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 验证管理员 JWT Token
 */
export const verifyAdminToken = (token: string): { email: string; role: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string; type: string };
    if (decoded.type !== 'admin') {
      return null;
    }
    return { email: decoded.email, role: decoded.role };
  } catch (error) {
    return null;
  }
};

/**
 * 管理员认证中间件
 * 验证请求头中的 Authorization: Bearer <token>
 */
export const adminAuthMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'No token provided'
    });
  }
  
  const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
  const decoded = verifyAdminToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  // 将管理员信息附加到请求对象
  req.admin = decoded;
  next();
};

/**
 * 超级管理员权限中间件
 * 必须在 adminAuthMiddleware 之后使用
 */
export const superAdminMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'forbidden',
      message: 'Super admin access required'
    });
  }
  next();
};

export default {
  validateAdminCredentials,
  generateAdminToken,
  verifyAdminToken,
  adminAuthMiddleware,
  superAdminMiddleware
};
