/**
 * 清理过期的云存储文件
 * 删除超过指定天数的生成文件
 */

import admin from 'firebase-admin';
import { getFirestore } from '../services/firebaseAdmin.js';

const DAYS_TO_KEEP = 7; // 保留7天

async function cleanupOldFiles() {
  console.log('[Cleanup] Starting storage cleanup...');
  
  // 确保 Firebase 已初始化
  getFirestore();
  
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'aikidprint.firebasestorage.app';
  const bucket = admin.storage().bucket(bucketName);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);
  
  console.log(`[Cleanup] Deleting files older than ${cutoffDate.toISOString()}`);
  
  try {
    // 获取 generated/worksheets 目录下的所有文件
    const [files] = await bucket.getFiles({ prefix: 'generated/worksheets/' });
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const [metadata] = await file.getMetadata();
        const createdTime = new Date(metadata.timeCreated || Date.now());
        
        if (createdTime < cutoffDate) {
          await file.delete();
          deletedCount++;
          console.log(`[Cleanup] Deleted: ${file.name}`);
        }
      } catch (err) {
        errorCount++;
        console.error(`[Cleanup] Error processing ${file.name}:`, err);
      }
    }
    
    console.log(`[Cleanup] Complete! Deleted ${deletedCount} files, ${errorCount} errors`);
    console.log(`[Cleanup] Remaining files: ${files.length - deletedCount}`);
    
  } catch (error) {
    console.error('[Cleanup] Failed:', error);
    process.exit(1);
  }
}

// 直接运行
cleanupOldFiles().then(() => {
  console.log('[Cleanup] Done');
  process.exit(0);
}).catch(err => {
  console.error('[Cleanup] Fatal error:', err);
  process.exit(1);
});
