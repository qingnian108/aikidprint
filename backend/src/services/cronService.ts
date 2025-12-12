import cron from 'node-cron';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sendWeeklyPackEmail } from './emailService.js';
import { generateWeeklyPackConfig } from './generators/weeklyPackService.js';
import { ImageGenerator } from './imageGenerator.js';
import { 
  literacyGenerators, 
  mathGenerators, 
  logicGenerators, 
  creativityGenerators,
  fineMotorGenerators,
  generateConnectDots as generateConnectDotsData 
} from './generators/index.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pack 数据存储目录
const PACKS_DIR = path.join(__dirname, '../../data/packs');

// 确保目录存在
if (!fs.existsSync(PACKS_DIR)) {
  fs.mkdirSync(PACKS_DIR, { recursive: true });
}

// 初始化 Firebase Admin（如果还没初始化）
const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // 优先使用文件方式
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized from service account file');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // 备选：使用环境变量
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
      console.log('✅ Firebase Admin initialized from environment variable');
    } else {
      console.warn('⚠️ Firebase service account not found, some features may not work');
      return null;
    }
  }
  return getFirestore();
};

// 获取当前周数
const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// 生成唯一 packId
function generatePackId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成的页面接口
interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

// 生成所有页面图片
const generateAllPages = async (
  childName: string,
  age: string,
  theme: string
): Promise<GeneratedPage[]> => {
  console.log(`[Cron] Generating pages for ${childName}, age ${age}, theme ${theme}`);
  
  const imageGenerator = new ImageGenerator();
  await imageGenerator.initialize();
  
  // 获取配置
  const config = await generateWeeklyPackConfig(childName, age, theme);
  const generatedPages: GeneratedPage[] = [];

  for (const page of config.pages) {
    try {
      let imageUrl = '';
      
      // 根据页面类型调用对应的数据生成器，再调用图片渲染器
      switch (page.type) {
        case 'cover':
          imageUrl = page.config.coverImage || '';
          break;
          
        case 'write-my-name': {
          const generator = literacyGenerators.get('write-my-name');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateWriteMyName({ content: data.content });
          }
          break;
        }
          
        case 'uppercase-tracing': {
          const generator = literacyGenerators.get('uppercase-tracing');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateUppercaseTracing(data.content);
          }
          break;
        }
          
        case 'lowercase-tracing': {
          const generator = literacyGenerators.get('lowercase-tracing');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateLowercaseTracing(data.content);
          }
          break;
        }
          
        case 'letter-recognition': {
          const generator = literacyGenerators.get('letter-recognition');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateLetterRecognitionPage(data.content);
          }
          break;
        }
          
        case 'number-tracing': {
          const generator = mathGenerators.get('number-tracing');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateNumberTracingPage(data.content);
          } else {
            imageUrl = await imageGenerator.generateNumberTracingPage(page.config);
          }
          break;
        }
          
        case 'counting-objects': {
          const generator = mathGenerators.get('counting-objects');
          if (generator) {
            const data = await generator(page.config);
            const content = Array.isArray(data.content) ? data.content[0] : data.content;
            imageUrl = await imageGenerator.generateCountAndWrite(content);
          }
          break;
        }
          
        case 'maze': {
          const generator = logicGenerators.get('maze');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateMazePage({ content: data.content });
          }
          break;
        }
          
        case 'pattern-sequencing': {
          const generator = logicGenerators.get('pattern-sequencing');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generatePatternSequencing(data.content);
          }
          break;
        }
        
        case 'shadow-matching': {
          const generator = logicGenerators.get('shadow-matching');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateShadowMatching(data.content);
          }
          break;
        }
        
        case 'sorting': {
          const generator = logicGenerators.get('sorting');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateSortingPage(data.content);
          }
          break;
        }
        
        case 'pattern-compare': {
          const generator = logicGenerators.get('pattern-compare');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generatePatternComparePage(data.content);
          }
          break;
        }
          
        case 'number-path': {
          const data = await generateConnectDotsData(page.config);
          imageUrl = await imageGenerator.generateConnectDots(data.content);
          break;
        }
          
        case 'coloring-page': {
          const generator = creativityGenerators.get('coloring-page');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateColoringPage(data.content);
          }
          break;
        }
          
        case 'creative-prompt': {
          const generator = creativityGenerators.get('creative-prompt');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateCreativePrompt(data.content);
          }
          break;
        }
        
        case 'trace-lines': {
          const generator = fineMotorGenerators.get('trace-lines');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateTraceLines(data.content);
          }
          break;
        }
        
        case 'shape-tracing': {
          const generator = fineMotorGenerators.get('shape-tracing');
          if (generator) {
            const data = await generator(page.config);
            imageUrl = await imageGenerator.generateShapeTracing(data.content);
          }
          break;
        }
          
        default:
          console.warn(`[Cron] Unknown page type: ${page.type}`);
          continue;
      }
      
      if (imageUrl) {
        generatedPages.push({
          order: page.order,
          type: page.type,
          title: page.title,
          imageUrl
        });
        console.log(`[Cron] Generated ${page.type}: ${imageUrl}`);
      }
    } catch (pageError) {
      console.error(`[Cron] Error generating ${page.type}:`, pageError);
    }
  }

  return generatedPages;
};

// 生成 PDF
const generatePackPDF = async (
  childName: string,
  age: string,
  theme: string
): Promise<Buffer> => {
  console.log(`[Cron] Generating PDF for ${childName}, age ${age}, theme ${theme}`);
  
  // 生成所有页面图片
  const pages = await generateAllPages(childName, age, theme);
  
  if (pages.length === 0) {
    throw new Error('No pages generated');
  }
  
  // 使用 Puppeteer 生成 PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  // 构建 HTML - 每个图片一页
  const pagesHtml = pages.map((p, index) => {
    let imageUrl = p.imageUrl;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `http://localhost:3000${imageUrl}`;
    }
    
    return `
      <div class="page" ${index < pages.length - 1 ? 'style="page-break-after: always;"' : ''}>
        <img src="${imageUrl}" alt="${p.title}" />
      </div>
    `;
  }).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${childName}'s Weekly Pack</title>
      <style>
        @page {
          size: 794px 1123px;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 794px;
          margin: 0;
          padding: 0;
          background: white;
        }
        .page {
          width: 794px;
          height: 1123px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          overflow: hidden;
        }
        .page img {
          width: 794px;
          height: 1123px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;

  await page.setContent(html, { 
    waitUntil: 'networkidle0',
    timeout: 120000
  });

  // 等待所有图片加载完成
  await page.evaluate(`
    (async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        images
          .filter(img => !img.complete)
          .map(img => new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          }))
      );
    })()
  `);

  const pdfBuffer = await page.pdf({
    width: '794px',
    height: '1123px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  
  console.log(`[Cron] PDF generated, size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  return Buffer.from(pdfBuffer);
};

// 保存 pack 到文件系统
const savePackToFile = async (
  childName: string,
  age: string,
  theme: string,
  pages: GeneratedPage[],
  userId: string
): Promise<string> => {
  const packId = generatePackId();
  const packData = {
    packId,
    childName,
    age,
    theme,
    weekNumber: getCurrentWeekNumber(),
    pages,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    source: 'auto' as const // 标记为自动推送
  };

  const filePath = path.join(PACKS_DIR, `${packId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(packData, null, 2));

  console.log(`[Cron] Saved pack ${packId} for ${childName}`);
  return packId;
};

// 处理单个用户的 Weekly Delivery
const processUserDelivery = async (
  db: FirebaseFirestore.Firestore,
  settings: any
): Promise<void> => {
  const { userId, email, childName, childAge, theme, deliveryMethod } = settings;
  
  console.log(`[Cron] Processing delivery for user ${userId}`);
  
  try {
    if (deliveryMethod === 'email') {
      // Email 模式：生成 PDF 并发送邮件
      const pdfBuffer = await generatePackPDF(childName, childAge, theme);
      
      // 发送邮件
      const success = await sendWeeklyPackEmail(
        email,
        childName,
        theme,
        getCurrentWeekNumber(),
        pdfBuffer
      );
      
      if (success) {
        console.log(`✅ [Cron] Email sent to ${email}`);
        
        // 记录发送历史
        await db.collection('weeklyDeliveryHistory').add({
          userId,
          email,
          childName,
          theme,
          weekNumber: getCurrentWeekNumber(),
          status: 'sent',
          sentAt: new Date()
        });
      } else {
        console.error(`❌ [Cron] Failed to send email to ${email}`);
        
        // 记录失败
        await db.collection('weeklyDeliveryHistory').add({
          userId,
          email,
          childName,
          theme,
          weekNumber: getCurrentWeekNumber(),
          status: 'failed',
          error: 'Email send failed',
          sentAt: new Date()
        });
      }
    } else {
      // Manual 模式：生成 pack 并保存到 dashboard，用户可以在 dashboard 下载
      console.log(`[Cron] Manual mode for ${userId}, generating pack for dashboard`);
      
      // 生成所有页面图片
      const pages = await generateAllPages(childName, childAge, theme);
      
      if (pages.length > 0) {
        // 保存 pack 到文件系统
        const packId = await savePackToFile(childName, childAge, theme, pages, userId);
        
        console.log(`✅ [Cron] Pack ${packId} saved for ${userId}`);
        
        // 记录生成历史
        await db.collection('weeklyDeliveryHistory').add({
          userId,
          childName,
          theme,
          weekNumber: getCurrentWeekNumber(),
          packId,
          status: 'generated',
          deliveryMethod: 'manual',
          createdAt: new Date()
        });
      } else {
        console.error(`❌ [Cron] No pages generated for ${userId}`);
        
        await db.collection('weeklyDeliveryHistory').add({
          userId,
          childName,
          theme,
          weekNumber: getCurrentWeekNumber(),
          status: 'failed',
          error: 'No pages generated',
          createdAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error(`❌ [Cron] Error processing delivery for ${userId}:`, error);
    
    // 记录错误
    try {
      await db.collection('weeklyDeliveryHistory').add({
        userId,
        childName,
        theme,
        weekNumber: getCurrentWeekNumber(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date()
      });
    } catch (logError) {
      console.error(`[Cron] Failed to log error:`, logError);
    }
  }
};

// Execute Weekly Delivery task
export const runWeeklyDelivery = async (): Promise<void> => {
  console.log('🚀 [Cron] Starting Weekly Delivery job...');
  
  try {
    const db = initFirebaseAdmin();
    
    if (!db) {
      console.error('❌ [Cron] Firebase Admin not initialized');
      return;
    }
    
    // Get all users with Weekly Delivery enabled
    const settingsSnapshot = await db
      .collection('weeklyDeliverySettings')
      .where('enabled', '==', true)
      .get();
    
    console.log(`[Cron] Found ${settingsSnapshot.size} users with Weekly Delivery enabled`);
    
    // Process each user
    for (const doc of settingsSnapshot.docs) {
      const settings = doc.data();
      await processUserDelivery(db, settings);
    }
    
    console.log('✅ [Cron] Weekly Delivery job completed');
  } catch (error) {
    console.error('❌ [Cron] Weekly Delivery job failed:', error);
  }
};

// 启动定时任务
export const startCronJobs = (): void => {
  const enableCron = process.env.ENABLE_CRON === 'true';
  
  if (!enableCron) {
    console.log('⏸️ Cron jobs disabled');
    return;
  }
  
  // 默认每周日早上 8 点执行
  const cronExpression = process.env.WEEKLY_DELIVERY_CRON || '0 8 * * 0';
  
  console.log(`📅 Starting cron job with expression: ${cronExpression}`);
  
  cron.schedule(cronExpression, async () => {
    console.log(`⏰ [${new Date().toISOString()}] Cron job triggered`);
    await runWeeklyDelivery();
  }, {
    timezone: process.env.TIMEZONE || 'America/New_York'
  });
  
  console.log('✅ Cron jobs started');
};

// 手动触发（用于测试）
export const triggerWeeklyDeliveryManually = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await runWeeklyDelivery();
    return { success: true, message: 'Weekly delivery triggered successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 初始化 Weekly Delivery（兼容旧接口）
export const initializeWeeklyDelivery = startCronJobs;

export default { 
  startCronJobs, 
  runWeeklyDelivery, 
  triggerWeeklyDeliveryManually,
  initializeWeeklyDelivery 
};
