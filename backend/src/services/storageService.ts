import admin from 'firebase-admin';
import { getFirestore } from './firebaseAdmin.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Storage bucket 名称（通常是 projectId.appspot.com）
const getBucket = () => {
  // 确保 Firebase 已初始化
  getFirestore();
  
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'aikidprint'}.appspot.com`;
  return admin.storage().bucket(bucketName);
};

/**
 * 上传文件到 Firebase Storage
 * @param localPath 本地文件路径
 * @param remotePath 云存储路径（如 worksheets/xxx.png）
 * @returns 公开访问的 URL
 */
export const uploadFile = async (localPath: string, remotePath: string): Promise<string> => {
  try {
    const bucket = getBucket();
    
    // 上传文件
    await bucket.upload(localPath, {
      destination: remotePath,
      metadata: {
        contentType: getContentType(localPath),
        cacheControl: 'public, max-age=31536000', // 缓存1年
      },
    });

    // 设置文件为公开可读
    const file = bucket.file(remotePath);
    await file.makePublic();

    // 返回公开 URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
    console.log(`[Storage] Uploaded: ${remotePath} -> ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('[Storage] Upload failed:', error);
    throw error;
  }
};

/**
 * 上传 Buffer 到 Firebase Storage
 * @param buffer 文件内容
 * @param remotePath 云存储路径
 * @param contentType MIME 类型
 * @returns 公开访问的 URL
 */
export const uploadBuffer = async (
  buffer: Buffer,
  remotePath: string,
  contentType: string = 'image/png'
): Promise<string> => {
  try {
    const bucket = getBucket();
    const file = bucket.file(remotePath);

    // 上传 buffer
    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // 设置文件为公开可读
    await file.makePublic();

    // 返回公开 URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
    console.log(`[Storage] Uploaded buffer: ${remotePath}`);
    
    return publicUrl;
  } catch (error) {
    console.error('[Storage] Upload buffer failed:', error);
    throw error;
  }
};

/**
 * 删除云存储中的文件
 */
export const deleteFile = async (remotePath: string): Promise<void> => {
  try {
    const bucket = getBucket();
    await bucket.file(remotePath).delete();
    console.log(`[Storage] Deleted: ${remotePath}`);
  } catch (error) {
    console.error('[Storage] Delete failed:', error);
    // 不抛出错误，删除失败不影响主流程
  }
};

/**
 * 根据文件扩展名获取 Content-Type
 */
const getContentType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
};

/**
 * 检查是否启用云存储
 */
export const isCloudStorageEnabled = (): boolean => {
  return process.env.USE_CLOUD_STORAGE === 'true';
};

/**
 * 智能保存文件：根据配置决定存本地还是云存储
 * @param localPath 本地文件路径（已存在的文件）
 * @param remotePath 云存储路径
 * @returns 访问 URL（本地路径或云存储 URL）
 */
export const saveFile = async (localPath: string, remotePath: string): Promise<string> => {
  if (isCloudStorageEnabled()) {
    // 上传到云存储
    const url = await uploadFile(localPath, remotePath);
    
    // 上传成功后删除本地文件（可选）
    if (process.env.DELETE_LOCAL_AFTER_UPLOAD === 'true') {
      try {
        fs.unlinkSync(localPath);
      } catch (e) {
        // 忽略删除失败
      }
    }
    
    return url;
  } else {
    // 返回本地相对路径
    return `/${remotePath}`;
  }
};

export default {
  uploadFile,
  uploadBuffer,
  deleteFile,
  saveFile,
  isCloudStorageEnabled,
};
