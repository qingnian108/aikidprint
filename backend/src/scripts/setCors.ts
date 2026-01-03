/**
 * 设置 Firebase Storage CORS 配置
 * 运行: npx ts-node src/scripts/setCors.ts
 */
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setCors() {
  const keyFilename = path.join(__dirname, '../../firebase-service-account.json');
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'aikidprint.firebasestorage.app';

  console.log(`Setting CORS for bucket: ${bucketName}`);
  console.log(`Using service account: ${keyFilename}`);

  const storage = new Storage({ keyFilename });
  const bucket = storage.bucket(bucketName);

  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET', 'HEAD'],
      maxAgeSeconds: 3600,
      responseHeader: ['Content-Type', 'Content-Length', 'Content-Disposition']
    }
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('✅ CORS configuration set successfully!');
    console.log('Configuration:', JSON.stringify(corsConfiguration, null, 2));
  } catch (error) {
    console.error('❌ Failed to set CORS:', error);
    process.exit(1);
  }
}

setCors();
