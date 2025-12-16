/**
 * PDF 生成工具
 * 根据用户的纸张设置生成 PDF，确保图片填满页面宽度
 */

import { jsPDF } from 'jspdf';

export type PaperSize = 'letter' | 'a4';

export interface PdfConfig {
  paperSize: PaperSize;
  filename: string;
}

/**
 * 获取纸张尺寸（毫米）
 */
export function getPaperDimensions(paperSize: PaperSize) {
  if (paperSize === 'a4') {
    return { width: 210, height: 297 };
  }
  // Letter
  return { width: 215.9, height: 279.4 };
}

/**
 * 从图片 URL 数组生成 PDF
 * 图片会填满页面宽度，高度按比例缩放，垂直居中
 */
export async function generatePdfFromImages(
  imageUrls: string[],
  config: PdfConfig
): Promise<void> {
  const { paperSize, filename } = config;
  const { width: pageWidth, height: pageHeight } = getPaperDimensions(paperSize);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize === 'a4' ? 'a4' : 'letter'
  });

  for (let i = 0; i < imageUrls.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageUrls[i];
    });

    // 以页面宽度为准，图片填满整个宽度，左右无空白
    // 如果图片比例比页面窄（如 A4 图片放到 Letter 纸），高度会超出，上下会被裁剪
    const imgRatio = img.width / img.height;
    const imgWidth = pageWidth;
    const imgHeight = pageWidth / imgRatio;
    const x = 0;
    const y = (pageHeight - imgHeight) / 2; // 垂直居中

    pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
  }

  pdf.save(filename);
}

/**
 * 从单张图片生成 PDF
 */
export async function generatePdfFromImage(
  imageUrl: string,
  config: PdfConfig
): Promise<void> {
  return generatePdfFromImages([imageUrl], config);
}
