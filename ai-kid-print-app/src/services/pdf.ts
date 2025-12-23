import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import { Platform, PermissionsAndroid } from 'react-native';
import { GeneratedPage } from '../types';

const { fs, config } = ReactNativeBlobUtil;

// PDF 页面尺寸（点）
const PAGE_SIZES = {
  letter: { width: 612, height: 792 },
  a4: { width: 595, height: 842 },
};

/**
 * 请求存储权限（Android）
 */
const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: '存储权限',
        message: '需要存储权限来保存 PDF 文件',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
};

/**
 * 下载图片到本地
 */
const downloadImage = async (url: string, filename: string): Promise<string> => {
  const downloadDir = fs.dirs.CacheDir;
  const filePath = `${downloadDir}/${filename}`;

  const response = await config({
    fileCache: true,
    path: filePath,
  }).fetch('GET', url);

  return response.path();
};

/**
 * 生成 PDF 文件名
 */
const generatePdfFilename = (childName: string, theme: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeName = childName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  return `AIKidPrint_${safeName}_${theme}_${timestamp}.pdf`;
};

export const pdfService = {
  /**
   * 生成 PDF 并保存
   */
  generatePDF: async (
    pages: GeneratedPage[],
    childName: string,
    theme: string,
    paperSize: 'letter' | 'a4' = 'letter'
  ): Promise<string> => {
    // 请求权限
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      throw new Error('没有存储权限');
    }

    try {
      // 下载所有图片
      const imagePaths: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const imagePath = await downloadImage(
          page.imageUrl,
          `page_${page.order}.png`
        );
        imagePaths.push(imagePath);
      }

      // 生成 PDF 文件名
      const pdfFilename = generatePdfFilename(childName, theme);
      const downloadDir = Platform.OS === 'android'
        ? fs.dirs.DownloadDir
        : fs.dirs.DocumentDir;
      const pdfPath = `${downloadDir}/${pdfFilename}`;

      // 注意：实际的 PDF 生成需要使用专门的 PDF 库
      // 这里我们先返回第一张图片的路径作为示例
      // 在实际项目中，应该使用 react-native-pdf-lib 或类似库
      
      // 暂时返回图片路径（实际应该是 PDF 路径）
      if (imagePaths.length > 0) {
        // 复制第一张图片到下载目录作为示例
        await fs.cp(imagePaths[0], pdfPath.replace('.pdf', '.png'));
        return pdfPath.replace('.pdf', '.png');
      }

      throw new Error('没有可用的页面');
    } catch (error: any) {
      console.error('PDF generation error:', error);
      throw new Error(error.message || 'PDF 生成失败');
    }
  },

  /**
   * 分享 PDF 文件
   */
  sharePDF: async (filePath: string): Promise<void> => {
    try {
      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
        title: '分享练习册',
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        throw new Error('分享失败');
      }
    }
  },

  /**
   * 打开 PDF 文件
   */
  openPDF: async (filePath: string): Promise<void> => {
    try {
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/pdf'
        );
      } else {
        await Share.open({
          url: filePath,
          type: 'application/pdf',
        });
      }
    } catch (error: any) {
      throw new Error('无法打开文件');
    }
  },

  /**
   * 检查文件是否存在
   */
  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      return await fs.exists(filePath);
    } catch {
      return false;
    }
  },

  /**
   * 删除缓存文件
   */
  clearCache: async (): Promise<void> => {
    try {
      const cacheDir = fs.dirs.CacheDir;
      const files = await fs.ls(cacheDir);
      for (const file of files) {
        if (file.startsWith('page_')) {
          await fs.unlink(`${cacheDir}/${file}`);
        }
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  },
};

export default pdfService;
