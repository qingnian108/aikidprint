import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { imageRandomizer } from './imageRandomizer.js';

export interface LetterAsset {
    image: string;
    word: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const UPLOADS_BIGPNG_DIR = path.join(PUBLIC_DIR, 'uploads', 'bigpng');

const letterWords: Record<string, string> = {
    'A': 'Apple',
    'B': 'Ball',
    'C': 'Cat',
    'D': 'Dog',
    'E': 'Elephant',
    'F': 'Frog',
    'G': 'Giraffe',
    'H': 'Horse',
    'I': 'Ice Cream',
    'J': 'Jellyfish',
    'K': 'Kite',
    'L': 'Lion',
    'M': 'Monkey',
    'N': 'Nest',
    'O': 'Octopus',
    'P': 'Penguin',
    'Q': 'Queen',
    'R': 'Robot',
    'S': 'Sun',
    'T': 'Tiger',
    'U': 'Umbrella',
    'V': 'Violin',
    'W': 'Whale',
    'X': 'Xylophone',
    'Y': 'Yarn',
    'Z': 'Zebra'
};

const emojiMap: Record<string, string> = {
    'A': '🍎',
    'B': '🎈',
    'C': '🐱',
    'D': '🐕',
    'E': '🐘',
    'F': '🐸',
    'G': '🦒',
    'H': '🐴',
    'I': '🍦',
    'J': '🤹',
    'K': '🔑',
    'L': '🦁',
    'M': '🐵',
    'N': '🥜',
    'O': '🐙',
    'P': '🐧',
    'Q': '👑',
    'R': '🤖',
    'S': '🌞',
    'T': '🐯',
    'U': '☂️',
    'V': '🎻',
    'W': '🍉',
    'X': '❌',
    'Y': '🧶',
    'Z': '🦓'
};

const toTitleCase = (value: string) => {
    if (!value) return value;
    return value
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const extractWordFromFilename = (filePath: string) => {
    const basename = path.basename(filePath, path.extname(filePath));
    const match = basename.match(/^([A-Za-z]+)/);
    return match ? match[1] : basename;
};

const findUploadImagesForLetter = (letter: string) => {
    if (!fs.existsSync(UPLOADS_BIGPNG_DIR)) return [];

    const lowerPrefix = letter.toLowerCase();
    const results: string[] = [];

    const walk = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }

            if (!entry.isFile()) continue;

            if (/\.(png|jpg|jpeg|svg)$/i.test(entry.name) &&
                entry.name.toLowerCase().startsWith(lowerPrefix)) {
                const relativePath = path.relative(PUBLIC_DIR, fullPath).split(path.sep).join('/');
                results.push('/' + relativePath);
            }
        }
    };

    walk(UPLOADS_BIGPNG_DIR);

    return results;
};

const findUploadAnimalImages = () => {
    if (!fs.existsSync(UPLOADS_BIGPNG_DIR)) return [];

    const results: string[] = [];

    const walk = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // 只在名称包含 animal 的目录内收集图片，但也递归子目录
                const isAnimalDir = entry.name.toLowerCase().includes('animal');
                if (isAnimalDir) {
                    const files = fs.readdirSync(fullPath, { withFileTypes: true })
                        .filter(f => f.isFile() && /\.(png|jpg|jpeg|svg)$/i.test(f.name));
                    for (const file of files) {
                        const filePath = path.join(fullPath, file.name);
                        const relativePath = path.relative(PUBLIC_DIR, filePath).split(path.sep).join('/');
                        results.push('/' + relativePath);
                    }
                }
                walk(fullPath);
            }
        }
    };

    walk(UPLOADS_BIGPNG_DIR);

    return results;
};

export function getRandomAnimalImages(count: number = 2): string[] {
    const uploadAnimals = findUploadAnimalImages();
    const images: string[] = uploadAnimals;

    // 后备：如果 uploads 没图，可以考虑补充 /images 目录下的 animals 子目录
    const animalsDir = path.join(IMAGES_DIR, 'animals');
    if (images.length === 0 && fs.existsSync(animalsDir)) {
        const files = fs.readdirSync(animalsDir)
            .filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file))
            .map(file => `/images/animals/${file}`);
        images.push(...files);
    }

    // 仍然没有文件，返回空数组，让上层使用 emoji 兜底
    if (images.length === 0) return [];

    const picks: string[] = [];
    const key = 'custom-name-animals';

    for (let i = 0; i < count; i++) {
        const selected = imageRandomizer.getRandomImage(key, images);
        // 避免单次调用内重复
        if (!picks.includes(selected) || images.length === 1) {
            picks.push(selected);
        } else if (images.length > 1) {
            // 如果重复且还有其他图片，重试一次
            const alt = imageRandomizer.getRandomImage(key, images);
            if (!picks.includes(alt)) {
                picks.push(alt);
            }
        }
    }

    return picks;
}

/**
 * 获取字母对应的图片（智能随机选择，不重复）
 * @param letter 字母
 * @param keyword 可选的关键词，用于筛选图片（如'cat'）
 * @returns 单张图片路径（随机且不重复）
 */
export function getLetterImage(letter: string, keyword?: string): LetterAsset {
    const upperLetter = letter.toUpperCase();
    const letterDir = path.join(IMAGES_DIR, 'letters', upperLetter);
    const defaultWord = letterWords[upperLetter] || `Letter ${upperLetter}`;
    let word = defaultWord;

    // 优先从 uploads/bigpng 中按首字母匹配的图片
    const uploadImages = findUploadImagesForLetter(upperLetter);
    if (uploadImages.length > 0) {
        const key = `uploads-letter-${upperLetter}-${keyword || 'default'}`;
        const selectedImage = imageRandomizer.getRandomImage(key, uploadImages);
        const derivedWord = keyword
            ? toTitleCase(keyword)
            : toTitleCase(extractWordFromFilename(selectedImage));

        return {
            image: selectedImage,
            word: derivedWord || defaultWord
        };
    }
    
    // 如果 /images 目录存在对应文件夹，使用其中的图片
    if (fs.existsSync(letterDir)) {
        let files = fs.readdirSync(letterDir)
            .filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file));
        
        // 如果提供了关键词，筛选包含该关键词的文件
        if (keyword) {
            const matchedFiles = files.filter(file => 
                file.toLowerCase().includes(keyword.toLowerCase())
            );
            
            // 如果找到匹配的文件，使用匹配的；否则使用所有文件
            if (matchedFiles.length > 0) {
                files = matchedFiles;
            }
        }
        
        if (files.length > 0) {
            const imagePaths = files.map(file => `/images/letters/${upperLetter}/${file}`);
            
            // 使用随机选择器（不重复）
            const key = `letter-${upperLetter}-${keyword || 'default'}`;
            const selectedImage = imageRandomizer.getRandomImage(key, imagePaths);
            
            // 使用关键词作为展示文案；否则保留默认单词映射
            if (keyword) {
                word = toTitleCase(keyword);
            }
            
            return { image: selectedImage, word };
        }
    }
    
    // 如果没有图片，返回 emoji 作为后备
    const image = emojiMap[upperLetter] || '📝';
    if (keyword) {
        word = toTitleCase(keyword);
    }
    
    return { image, word };
}

/**
 * 获取数学主题的图片
 */
export function getMathImages(theme: string): string[] {
    const themeDir = path.join(IMAGES_DIR, 'math', theme);
    
    if (fs.existsSync(themeDir)) {
        const files = fs.readdirSync(themeDir)
            .filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file))
            .map(file => `/images/math/${theme}/${file}`);
        
        if (files.length > 0) {
            return files;
        }
    }
    
    // 后备 emoji
    const fallbackEmoji: Record<string, string[]> = {
        'animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
        'vehicles': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️'],
        'fruits': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇']
    };
    
    return fallbackEmoji[theme] || ['🔢'];
}

/**
 * 获取艺术背景图片
 */
export function getArtBackground(background: string): string | null {
    const bgPath = path.join(IMAGES_DIR, 'art/backgrounds', `${background}.png`);
    
    if (fs.existsSync(bgPath)) {
        return `/images/art/backgrounds/${background}.png`;
    }
    
    return null;
}

/**
 * 获取艺术角色图片
 */
export function getArtCharacter(character: string): string | null {
    const charPath = path.join(IMAGES_DIR, 'art/characters', `${character}.png`);
    
    if (fs.existsSync(charPath)) {
        return `/images/art/characters/${character}.png`;
    }
    
    return null;
}

/**
 * 检查是否为图片文件（而不是emoji）
 */
export function isImageFile(assetPath: string): boolean {
    return typeof assetPath === 'string' && (assetPath.startsWith('/images/') || assetPath.startsWith('/uploads/'));
}

// 收集上传库中所有图案（用于随机小贴图）
let cachedUploads: { paths: string[]; ts: number } | null = null;
const collectAllUploadImages = () => {
    const now = Date.now();
    // 简单缓存 60 秒，减少频繁遍历磁盘
    if (cachedUploads && now - cachedUploads.ts < 60_000) {
        return cachedUploads.paths;
    }

    if (!fs.existsSync(UPLOADS_BIGPNG_DIR)) return [];

    const results: string[] = [];

    const walk = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }

            if (!entry.isFile()) continue;

            if (/\.(png|jpg|jpeg|svg)$/i.test(entry.name)) {
                const relativePath = path.relative(PUBLIC_DIR, fullPath).split(path.sep).join('/');
                results.push('/' + relativePath);
            }
        }
    };

    walk(UPLOADS_BIGPNG_DIR);
    cachedUploads = { paths: results, ts: now };
    return results;
};

/**
 * 随机获取若干小图案，用于装饰
 */
export function getRandomDecorImages(count: number = 10): string[] {
    const pool = collectAllUploadImages();
    const picks: string[] = [];

    if (pool.length > 0) {
        const max = Math.min(count, pool.length);
        const poolCopy = [...pool];
        for (let i = 0; i < max; i++) {
            const idx = Math.floor(Math.random() * poolCopy.length);
            picks.push(poolCopy[idx]);
            poolCopy.splice(idx, 1);
        }
        return picks;
    }

    // fallback emoji
    const fallback = ['🌟', '🌈', '🍎', '🚗', '🐶', '🦄', '🍓', '🚀', '🦖', '🐱'];
    return fallback.slice(0, count);
}

export function getThemeImages(theme: string, count: number = 10): string[] {
    const allImages = collectAllUploadImages();
    let filtered: string[] = [];

    const themeMap: Record<string, string[]> = {
        'animals': ['animal', 'farm', 'zoo', 'pet', 'insect', 'dinosaur'],
        'food': ['food', 'fruit', 'vegetable', 'bread', 'sweet'],
        'clothes': ['cloth', 'wear', 'hat', 'shoe', 'sock'],
        'people': ['family', 'dad', 'mom', 'baby', 'job', 'sport'],
        'nature': ['nature', 'plant', 'flower', 'tree', 'leaf'],
        'vehicles': ['vehicle', 'car', 'bus', 'truck', 'boat', 'plane']
    };

    const keywords = themeMap[theme.toLowerCase()] || [theme.toLowerCase()];

    filtered = allImages.filter(path => 
        keywords.some(k => path.toLowerCase().includes(k))
    );

    if (filtered.length === 0) {
        filtered = allImages; // Fallback to all if no match
    }

    // Randomize and pick
    const picks: string[] = [];
    const poolCopy = [...filtered];
    const max = Math.min(count, poolCopy.length);
    
    for (let i = 0; i < max; i++) {
        const idx = Math.floor(Math.random() * poolCopy.length);
        picks.push(poolCopy[idx]);
        poolCopy.splice(idx, 1);
    }
    
    return picks;
}

/**
 * 获取主题角色图片（招手姿势）
 * @param theme 主题名称 (dinosaur, ocean, space, unicorn, vehicles, safari)
 * @returns 角色图片路径
 */
export function getThemeCharacter(theme: string): string {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const characterDir = path.join(ASSETS_DIR, 'B_character_ip', theme, 'poses', 'color');
    
    // 强制使用 waving_pose 命名的图片（招手姿势）
    if (fs.existsSync(characterDir)) {
        const files = fs.readdirSync(characterDir).filter(f => f.endsWith('.png'));
        const waving = files.find(f => f.includes('waving_pose'));
        if (waving) {
            return `/uploads/assets/B_character_ip/${theme}/poses/color/${waving}`;
        }
        // 其次选择与主题名匹配的任意姿势
        const matching = files.find(f => f.includes(theme));
        if (matching) {
            return `/uploads/assets/B_character_ip/${theme}/poses/color/${matching}`;
        }
        // 否则返回第一个可用的姿势
        if (files.length > 0) {
            return `/uploads/assets/B_character_ip/${theme}/poses/color/${files[0]}`;
        }
    }
    
    // 后备 emoji
    const emojiMap: Record<string, string> = {
        'dinosaur': '🦖',
        'ocean': '🐋',
        'space': '🚀',
        'unicorn': '🦄',
        'vehicles': '🚗',
        'safari': '🦁'
    };
    return emojiMap[theme] || '⭐';
}

/**
 * 获取主题彩色素材
 * @param theme 主题名称
 * @param count 需要的数量
 * @returns 彩色素材路径数组
 */
export function getThemeColorAssets(theme: string, count: number = 10): string[] {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const colorDir = path.join(ASSETS_DIR, 'A_main_assets', theme, 'color');
    
    if (fs.existsSync(colorDir)) {
        const files = fs.readdirSync(colorDir)
            .filter(f => f.endsWith('_color.png'))
            .map(f => `/uploads/assets/A_main_assets/${theme}/color/${f}`);
        
        if (files.length > 0) {
            // 随机选择
            const picks: string[] = [];
            const poolCopy = [...files];
            const max = Math.min(count, poolCopy.length);
            
            for (let i = 0; i < max; i++) {
                const idx = Math.floor(Math.random() * poolCopy.length);
                picks.push(poolCopy[idx]);
                poolCopy.splice(idx, 1);
            }
            
            return picks;
        }
    }
    
    return [];
}

/**
 * 获取主题主要线稿素材（从 line/main 子文件夹）
 * @param theme 主题名称
 * @param count 需要的数量
 * @returns 线稿素材路径数组
 */
export function getThemeMainLineAssets(theme: string, count: number = 1): string[] {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const mainLineDir = path.join(ASSETS_DIR, 'A_main_assets', theme, 'line', 'main');
    
    if (fs.existsSync(mainLineDir)) {
        const files = fs.readdirSync(mainLineDir)
            .filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f))
            .map(f => `/uploads/assets/A_main_assets/${theme}/line/main/${f}`);
        
        if (files.length > 0) {
            // 随机选择
            const picks: string[] = [];
            const poolCopy = [...files];
            const max = Math.min(count, poolCopy.length);
            
            for (let i = 0; i < max; i++) {
                const idx = Math.floor(Math.random() * poolCopy.length);
                picks.push(poolCopy[idx]);
                poolCopy.splice(idx, 1);
            }
            
            return picks;
        }
    }
    
    return [];
}

/**
 * 获取主题主要彩色素材（从 color/main 子文件夹）
 * @param theme 主题名称
 * @param count 需要的数量
 * @returns 彩色素材路径数组
 */
export function getThemeMainColorAssets(theme: string, count: number = 1): string[] {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const mainColorDir = path.join(ASSETS_DIR, 'A_main_assets', theme, 'color', 'main');
    
    if (fs.existsSync(mainColorDir)) {
        const files = fs.readdirSync(mainColorDir)
            .filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f))
            .map(f => `/uploads/assets/A_main_assets/${theme}/color/main/${f}`);
        
        if (files.length > 0) {
            const picks: string[] = [];
            
            // 如果素材不够count个，循环重复取
            // 先打乱顺序，然后循环填充
            const shuffled = [...files].sort(() => Math.random() - 0.5);
            for (let i = 0; i < count; i++) {
                picks.push(shuffled[i % shuffled.length]);
            }
            
            return picks;
        }
    }
    
    return [];
}

/**
 * 获取主题背景图案（patterns）
 * @param theme 主题名称
 * @returns 背景图案路径，如果没有则返回空字符串
 */
export function getThemePattern(theme: string): string {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const patternDir = path.join(ASSETS_DIR, 'D_patterns', theme, 'patterns');
    
    if (fs.existsSync(patternDir)) {
        const files = fs.readdirSync(patternDir)
            .filter(f => f.endsWith('_pattern.png'));
        
        if (files.length > 0) {
            // 随机选择一个背景图案
            const randomFile = files[Math.floor(Math.random() * files.length)];
            return `/uploads/assets/D_patterns/${theme}/patterns/${randomFile}`;
        }
    }
    
    return '';
}

/**
 * 获取主题边框贴纸（用于外围装饰）
 */
export function getThemeBorders(theme: string, count: number = 10): string[] {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const borderDir = path.join(ASSETS_DIR, 'D_patterns', theme, 'borders');

    if (!fs.existsSync(borderDir)) {
        return [];
    }

    const files = fs.readdirSync(borderDir)
        .filter(f => f.endsWith('_border.png'));

    if (files.length === 0) return [];

    const pool = [...files];
    const picks: string[] = [];
    const max = Math.min(count, pool.length);

    for (let i = 0; i < max; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const filename = pool[idx];
        picks.push(`/uploads/assets/D_patterns/${theme}/borders/${filename}`);
        pool.splice(idx, 1);
    }

    return picks;
}

/**
 * 主题配色方案
 */
export const THEME_COLORS: Record<string, { primary: string; secondary: string; accent: string; light: string }> = {
    dinosaur: {
        primary: '#4CAF50',    // 绿色
        secondary: '#81C784',
        accent: '#2E7D32',
        light: 'rgba(76, 175, 80, 0.1)'
    },
    ocean: {
        primary: '#2196F3',    // 蓝色
        secondary: '#64B5F6',
        accent: '#1565C0',
        light: 'rgba(33, 150, 243, 0.1)'
    },
    space: {
        primary: '#673AB7',    // 紫色
        secondary: '#9575CD',
        accent: '#4527A0',
        light: 'rgba(103, 58, 183, 0.1)'
    },
    unicorn: {
        primary: '#E91E63',    // 粉色
        secondary: '#F48FB1',
        accent: '#AD1457',
        light: 'rgba(233, 30, 99, 0.1)'
    },
    vehicles: {
        primary: '#FF9800',    // 橙色
        secondary: '#FFB74D',
        accent: '#E65100',
        light: 'rgba(255, 152, 0, 0.1)'
    },
    safari: {
        primary: '#795548',    // 棕色
        secondary: '#A1887F',
        accent: '#4E342E',
        light: 'rgba(121, 85, 72, 0.1)'
    }
};

/**
 * 获取主题配色
 */
export function getThemeColor(theme: string): { primary: string; secondary: string; accent: string; light: string } {
    return THEME_COLORS[theme.toLowerCase()] || THEME_COLORS.dinosaur;
}

/**
 * 随机获取主题标题图标（从 poses/color 目录）
 */
export function getRandomTitleIcon(theme: string): string {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const posesDir = path.join(ASSETS_DIR, 'B_character_ip', theme, 'poses', 'color');

    if (!fs.existsSync(posesDir)) {
        console.warn(`[ImageHelper] Poses directory not found: ${posesDir}`);
        return '';
    }

    const files = fs.readdirSync(posesDir)
        .filter(f => f.endsWith('.png'));

    if (files.length === 0) {
        console.warn(`[ImageHelper] No pose images found in: ${posesDir}`);
        return '';
    }

    // 随机选择一个
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `/uploads/assets/B_character_ip/${theme}/poses/color/${randomFile}`;
}


/**
 * 随机获取主题线稿图片（用于涂色页面）
 * @param theme 主题名称
 * @returns 线稿图片路径
 */
export function getRandomLineArt(theme: string): string {
    const ASSETS_DIR = path.join(PUBLIC_DIR, 'uploads', 'assets');
    const lineDir = path.join(ASSETS_DIR, 'A_main_assets', theme, 'line');

    if (!fs.existsSync(lineDir)) {
        console.warn(`[ImageHelper] Line art directory not found: ${lineDir}`);
        return '';
    }

    const files = fs.readdirSync(lineDir)
        .filter(f => f.endsWith('_line.svg') || f.endsWith('_line.png'));

    if (files.length === 0) {
        console.warn(`[ImageHelper] No line art images found in: ${lineDir}`);
        return '';
    }

    // 随机选择一个
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `/uploads/assets/A_main_assets/${theme}/line/${randomFile}`;
}


/**
 * 随机获取 Creative Prompt 图片
 * @param theme 主题名称 (dinosaur, ocean, safari, space, unicorn, vehicles)
 * @param promptType 类型 (blank_sign, halfbody)
 * @returns 图片路径
 */
export function getCreativePromptImage(theme: string, promptType: string): string {
    const CREATIVE_DIR = path.join(PUBLIC_DIR, 'uploads', 'Creative_Prompt', theme, promptType);

    if (!fs.existsSync(CREATIVE_DIR)) {
        console.warn(`[ImageHelper] Creative Prompt directory not found: ${CREATIVE_DIR}`);
        return '';
    }

    const files = fs.readdirSync(CREATIVE_DIR)
        .filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f));

    if (files.length === 0) {
        console.warn(`[ImageHelper] No images found in: ${CREATIVE_DIR}`);
        return '';
    }

    // 随机选择一个
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `/uploads/Creative_Prompt/${theme}/${promptType}/${randomFile}`;
}
