import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USAGE_FILE = path.join(__dirname, '../../data/image-usage.json');
const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ImageUsage {
    [key: string]: {
        usedImages: string[];
        allImages: string[];
    };
}

export class ImageRandomizer {
    private usage: ImageUsage = {};

    constructor() {
        this.loadUsage();
    }

    // 加载使用记录
    private loadUsage() {
        try {
            if (fs.existsSync(USAGE_FILE)) {
                const data = fs.readFileSync(USAGE_FILE, 'utf-8');
                this.usage = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load image usage:', error);
            this.usage = {};
        }
    }

    // 保存使用记录
    private saveUsage() {
        try {
            fs.writeFileSync(USAGE_FILE, JSON.stringify(this.usage, null, 2));
        } catch (error) {
            console.error('Failed to save image usage:', error);
        }
    }

    /**
     * 从图片列表中随机选择一张未使用的图片
     * @param key 唯一标识（如 'letter-C-cat'）
     * @param images 所有可用图片列表
     * @returns 选中的图片
     */
    getRandomImage(key: string, images: string[]): string {
        if (images.length === 0) {
            throw new Error('No images available');
        }

        // 如果只有一张图片，直接返回
        if (images.length === 1) {
            return images[0];
        }

        // 初始化或更新该 key 的记录
        if (!this.usage[key]) {
            this.usage[key] = {
                usedImages: [],
                allImages: [...images]
            };
        }

        // 检查图片列表是否有变化
        const currentImagesSet = new Set(images);
        const recordedImagesSet = new Set(this.usage[key].allImages);
        
        if (currentImagesSet.size !== recordedImagesSet.size || 
            ![...currentImagesSet].every(img => recordedImagesSet.has(img))) {
            // 图片列表有变化，重置记录
            this.usage[key] = {
                usedImages: [],
                allImages: [...images]
            };
        }

        // 获取未使用的图片
        let availableImages = images.filter(img => !this.usage[key].usedImages.includes(img));

        // 如果所有图片都用过了，重置循环
        if (availableImages.length === 0) {
            console.log(`All images used for ${key}, resetting cycle`);
            this.usage[key].usedImages = [];
            availableImages = [...images];
        }

        // 随机选择一张
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];

        // 记录已使用
        this.usage[key].usedImages.push(selectedImage);
        this.saveUsage();

        console.log(`Selected image for ${key}: ${selectedImage} (${this.usage[key].usedImages.length}/${images.length} used)`);

        return selectedImage;
    }

    /**
     * 重置某个 key 的使用记录
     */
    resetUsage(key: string) {
        if (this.usage[key]) {
            this.usage[key].usedImages = [];
            this.saveUsage();
        }
    }

    /**
     * 获取使用统计
     */
    getUsageStats(key: string): { used: number; total: number; remaining: number } | null {
        if (!this.usage[key]) {
            return null;
        }

        return {
            used: this.usage[key].usedImages.length,
            total: this.usage[key].allImages.length,
            remaining: this.usage[key].allImages.length - this.usage[key].usedImages.length
        };
    }
}

// 单例
export const imageRandomizer = new ImageRandomizer();
