import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, '../../data/history.json');
const OUTPUT_DIR = path.join(__dirname, '../../public/generated');
const MAX_IMAGES_PER_USER = 20;

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface WorksheetHistory {
    id: string;
    userId: string;
    categoryId: string;
    categoryName: string;
    pageTypeId: string;
    pageTypeName: string;
    imageUrl: string;
    imagePath: string;
    config: any;
    createdAt: string;
}

export class HistoryService {
    private history: WorksheetHistory[] = [];

    constructor() {
        this.loadHistory();
    }

    // 加载历史记录
    private loadHistory() {
        try {
            if (fs.existsSync(HISTORY_FILE)) {
                const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
                this.history = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.history = [];
        }
    }

    // 保存历史记录
    private saveHistory() {
        try {
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    // 添加历史记录
    addHistory(record: Omit<WorksheetHistory, 'id' | 'createdAt'>): WorksheetHistory {
        const newRecord: WorksheetHistory = {
            ...record,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
        };

        this.history.unshift(newRecord);
        
        // 清理超过限制的图片
        this.cleanupOldImages(record.userId);
        
        this.saveHistory();
        return newRecord;
    }

    // 清理用户的旧图片（保留最近20张）
    private cleanupOldImages(userId: string) {
        const userHistory = this.history.filter(h => h.userId === userId);
        
        if (userHistory.length > MAX_IMAGES_PER_USER) {
            const toDelete = userHistory.slice(MAX_IMAGES_PER_USER);
            
            toDelete.forEach(record => {
                // 删除图片文件
                try {
                    if (fs.existsSync(record.imagePath)) {
                        fs.unlinkSync(record.imagePath);
                        console.log(`Deleted old image: ${record.imagePath}`);
                    }
                } catch (error) {
                    console.error(`Failed to delete image: ${record.imagePath}`, error);
                }
                
                // 从历史记录中移除
                const index = this.history.findIndex(h => h.id === record.id);
                if (index > -1) {
                    this.history.splice(index, 1);
                }
            });
            
            this.saveHistory();
        }
    }

    // 获取用户历史记录
    getUserHistory(userId: string, limit: number = 20): WorksheetHistory[] {
        return this.history
            .filter(h => h.userId === userId)
            .slice(0, limit);
    }

    // 获取单条记录
    getHistoryById(id: string): WorksheetHistory | undefined {
        return this.history.find(h => h.id === id);
    }

    // 删除记录
    deleteHistory(id: string): boolean {
        const record = this.history.find(h => h.id === id);
        if (!record) return false;

        // 删除图片文件
        try {
            if (fs.existsSync(record.imagePath)) {
                fs.unlinkSync(record.imagePath);
            }
        } catch (error) {
            console.error(`Failed to delete image: ${record.imagePath}`, error);
        }

        // 从历史记录中移除
        const index = this.history.findIndex(h => h.id === id);
        if (index > -1) {
            this.history.splice(index, 1);
            this.saveHistory();
            return true;
        }

        return false;
    }
}

// 单例
export const historyService = new HistoryService();
