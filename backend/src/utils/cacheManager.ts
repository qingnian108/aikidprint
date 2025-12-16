/**
 * 缓存管理工具
 * 每个主题文件夹保留最新的 N 张图片
 */

import * as fs from 'fs';
import * as path from 'path';

const MAX_IMAGES_PER_THEME = 20;

/**
 * 清理文件夹，只保留最新的 N 张图片
 * @param folderPath 文件夹路径
 * @param maxCount 最大保留数量
 */
export function cleanupFolder(folderPath: string, maxCount: number = MAX_IMAGES_PER_THEME): void {
    if (!fs.existsSync(folderPath)) {
        return;
    }

    try {
        // 获取所有图片文件
        const files = fs.readdirSync(folderPath)
            .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
            .map(f => ({
                name: f,
                path: path.join(folderPath, f),
                mtime: fs.statSync(path.join(folderPath, f)).mtime.getTime()
            }))
            .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序

        // 如果超过最大数量，删除旧的
        if (files.length > maxCount) {
            const toDelete = files.slice(maxCount);
            toDelete.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`[CacheManager] Deleted old file: ${file.name}`);
                } catch {
                    // 静默忽略删除失败
                }
            });
            console.log(`[CacheManager] Cleaned ${toDelete.length} files from ${folderPath}`);
        }
    } catch (error) {
        console.error(`[CacheManager] Error cleaning folder ${folderPath}:`, error);
    }
}

/**
 * 清理主题文件夹下所有子文件夹
 * @param baseDir 基础目录（如 sketches 或 pattern-compare）
 * @param maxCount 每个主题最大保留数量
 */
export function cleanupThemeFolders(baseDir: string, maxCount: number = MAX_IMAGES_PER_THEME): void {
    if (!fs.existsSync(baseDir)) {
        return;
    }

    try {
        const themes = fs.readdirSync(baseDir)
            .filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

        themes.forEach(theme => {
            cleanupFolder(path.join(baseDir, theme), maxCount);
        });
    } catch (error) {
        console.error(`[CacheManager] Error cleaning theme folders:`, error);
    }
}
