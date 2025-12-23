/**
 * 缓存服务 - 离线支持
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { PackData } from '../types';

const { fs } = ReactNativeBlobUtil;
const CACHE_KEY_PREFIX = '@cache/';
const PACKS_CACHE_KEY = '@cache/packs';

export const cacheService = {
  /**
   * 缓存图片
   */
  cacheImage: async (url: string, filename: string): Promise<string> => {
    try {
      const cacheDir = fs.dirs.CacheDir;
      const filePath = `${cacheDir}/${filename}`;
      
      // 检查是否已缓存
      const exists = await fs.exists(filePath);
      if (exists) {
        return filePath;
      }

      // 下载并缓存
      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', url);

      return response.path();
    } catch (error) {
      console.error('Cache image error:', error);
      throw error;
    }
  },

  /**
   * 缓存 Pack 数据
   */
  cachePack: async (pack: PackData): Promise<void> => {
    try {
      const key = `${CACHE_KEY_PREFIX}pack_${pack.packId}`;
      await AsyncStorage.setItem(key, JSON.stringify(pack));

      // 更新 packs 列表
      const packsJson = await AsyncStorage.getItem(PACKS_CACHE_KEY);
      const packs: string[] = packsJson ? JSON.parse(packsJson) : [];
      if (!packs.includes(pack.packId)) {
        packs.push(pack.packId);
        await AsyncStorage.setItem(PACKS_CACHE_KEY, JSON.stringify(packs));
      }
    } catch (error) {
      console.error('Cache pack error:', error);
    }
  },

  /**
   * 获取缓存的 Pack
   */
  getCachedPack: async (packId: string): Promise<PackData | null> => {
    try {
      const key = `${CACHE_KEY_PREFIX}pack_${packId}`;
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Get cached pack error:', error);
      return null;
    }
  },

  /**
   * 获取所有缓存的 Packs
   */
  getAllCachedPacks: async (): Promise<PackData[]> => {
    try {
      const packsJson = await AsyncStorage.getItem(PACKS_CACHE_KEY);
      const packIds: string[] = packsJson ? JSON.parse(packsJson) : [];
      
      const packs: PackData[] = [];
      for (const packId of packIds) {
        const pack = await cacheService.getCachedPack(packId);
        if (pack) {
          packs.push(pack);
        }
      }
      return packs;
    } catch (error) {
      console.error('Get all cached packs error:', error);
      return [];
    }
  },

  /**
   * 清除所有缓存
   */
  clearAllCache: async (): Promise<void> => {
    try {
      // 清除 AsyncStorage 缓存
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);

      // 清除文件缓存
      const cacheDir = fs.dirs.CacheDir;
      const files = await fs.ls(cacheDir);
      for (const file of files) {
        await fs.unlink(`${cacheDir}/${file}`);
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  },

  /**
   * 获取缓存大小
   */
  getCacheSize: async (): Promise<number> => {
    try {
      const cacheDir = fs.dirs.CacheDir;
      const stat = await fs.stat(cacheDir);
      return stat.size || 0;
    } catch (error) {
      return 0;
    }
  },
};

export default cacheService;
