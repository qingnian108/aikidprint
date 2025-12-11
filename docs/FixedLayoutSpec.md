# 固定版式规范（Worksheet Design Specification）

> 用途：后端生成各模板时的固定版式参考，保持页面框架一致。后续如有逻辑备注或模板差异，请在本文件追加说明，勿改动既定尺寸/位置，除非同步更新全局规范。

---

## 一、页面基础尺寸

| 属性 | 值 | 说明 |
|------|-----|------|
| 页面宽度 | 794px | A4 纸 96dpi |
| 页面高度 | 1123px | A4 纸 96dpi |
| 设备像素比 | 1.25 | Puppeteer 截图时使用 |

---

## 二、页面结构层次

```
┌─────────────────────────────────────────┐
│  顶部栏 (top-bar): Name / Date          │  ← 高度 52px
├─────────────────────────────────────────┤
│  分隔线 (divider)                        │  ← 高度 1.5px
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      安全区 (safe-area)          │    │  ← 主内容区域
│  │                                 │    │
│  │      - 标题区                    │    │
│  │      - 内容区                    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [贴纸]                        [贴纸]    │  ← 左右边框贴纸
└─────────────────────────────────────────┘
```

---

## 三、各区域详细规范

### 3.1 顶部栏 (top-bar)
| 属性 | 值 |
|------|-----|
| 位置 | top: 0, left: 24px, right: 24px |
| 最小高度 | 52px |
| 内边距 | 14px 36px 12px |
| 字号 | 18px |
| 字重 | 600 |
| 颜色 | `#2e2e2e` |

**Name/Date 虚线：**
- 宽度：180px
- 边框：2px dashed `#b8c0cc`
- 垂直偏移：translateY(3-6px)

### 3.2 分隔线 (divider)
| 属性 | 值 |
|------|-----|
| 位置 | top: 60px, left: -24px |
| 宽度 | calc(100% + 48px) |
| 高度 | 1.5px |
| 颜色 | `#7adfc7` |
| 透明度 | 0.85 |

### 3.3 安全区 (safe-area)
| 属性 | 值 |
|------|-----|
| 位置 | left: 40px, top: 67px |
| 宽度 | calc(100% - 80px) |
| 高度 | calc(100% - 107px) |
| 内边距 | 24px 18px 16px |
| 圆角 | 16px |
| 边框 | 1.5px solid `#111827`（可选隐藏） |

### 3.4 边框贴纸 (border-sticker)
| 属性 | 值 |
|------|-----|
| 尺寸 | 36px × 36px |
| 数量 | 左右各 8 个，共 16 个 |
| 透明度 | 0.9 |
| 阴影 | drop-shadow(0 2px 4px rgba(0,0,0,0.12)) |

**左侧位置（top, left=2px）：**
110px, 230px, 350px, 470px, 590px, 710px, 830px, 950px

**右侧位置（top, right=2px）：**
110px, 230px, 350px, 470px, 590px, 710px, 830px, 950px

**旋转角度：** 随机 -6° ~ 6°

---

## 四、标题区规范

### 4.1 单行标题（大多数板块）
```css
.title {
    text-align: center;
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
}
```

### 4.2 带图标标题（如 Maze）
```css
.title-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}
.title-row .main { font-size: 38px; }
.title-row .title-icon { width: 68px; height: 68px; }
```

**图标位置：** 随机出现在标题左侧或右侧

```typescript
// 随机决定图标位置
const iconPosition = Math.random() > 0.5 ? 'left' : 'right';

// HTML 结构根据位置调整
const titleHtml = iconPosition === 'left' 
    ? `<img class="title-icon" src="${titleIcon}" /><span class="main">${title}</span>`
    : `<span class="main">${title}</span><img class="title-icon" src="${titleIcon}" />`;
```

### 4.3 副标题
```css
.subtitle {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #475569;
}
```

---

## 五、内容区布局模式

### 5.1 单图居中（Maze、Number Path）
```css
.content-box {
    margin: 0 auto;
    width: min(90%, 700px);
    aspect-ratio: 1 / 1;
    border: 2px solid #0f172a;
    border-radius: 16px;
    background: #fff;
}
```

### 5.2 网格布局（Counting Objects、Letter Recognition）
```css
.grid {
    display: grid;
    grid-template-columns: repeat(N, 1fr);
    gap: 12px;
}
```

### 5.3 左右分栏（Tracing）
```css
.two-column {
    display: flex;
    gap: 16px;
}
.left-panel { flex: 1; }
.right-panel { flex: 1; }
```

---

## 六、主题配置

### 6.1 支持的主题
| 主题 ID | 显示名称 |
|---------|----------|
| dinosaur | Dinosaur |
| ocean | Ocean |
| space | Space |
| unicorn | Unicorn |
| vehicles | Vehicles |
| safari | Safari |

### 6.2 主题资源目录结构
```
backend/public/uploads/assets/
├── A_main_assets/{theme}/color/     # 主要彩色素材
├── A_main_assets/{theme}/outline/   # 轮廓线稿
├── B_character_ip/{theme}/poses/    # 角色姿势图
├── C_cover_art/{theme}/             # 封面素材
└── D_patterns/{theme}/              # 边框贴纸图案
```

### 6.3 标题图标获取（随机）
```typescript
import { getRandomTitleIcon } from '../utils/imageHelper.js';

// 随机获取主题标题图标（从 poses/color 目录）
const titleIcon = getRandomTitleIcon(theme);
// 返回类似：/uploads/assets/B_character_ip/dinosaur/poses/color/dinosaur_waving_pose.png
```

**图标目录：** `B_character_ip/{theme}/poses/color/`

### 6.4 主题配色方案
| 主题 | 主色 (primary) | 次色 (secondary) | 强调色 (accent) | 浅色背景 (light) |
|------|----------------|------------------|-----------------|------------------|
| dinosaur | `#4CAF50` 绿色 | `#81C784` | `#2E7D32` | `rgba(76,175,80,0.1)` |
| ocean | `#2196F3` 蓝色 | `#64B5F6` | `#1565C0` | `rgba(33,150,243,0.1)` |
| space | `#673AB7` 紫色 | `#9575CD` | `#4527A0` | `rgba(103,58,183,0.1)` |
| unicorn | `#E91E63` 粉色 | `#F48FB1` | `#AD1457` | `rgba(233,30,99,0.1)` |
| vehicles | `#FF9800` 橙色 | `#FFB74D` | `#E65100` | `rgba(255,152,0,0.1)` |
| safari | `#795548` 棕色 | `#A1887F` | `#4E342E` | `rgba(121,85,72,0.1)` |

```typescript
import { getThemeColor } from '../utils/imageHelper.js';

const colors = getThemeColor(theme);
// colors.primary, colors.secondary, colors.accent, colors.light
```

### 6.4 贴纸获取
```typescript
// 获取主题边框贴纸
const borderImages = getThemeBorders(theme, 16);
// 不足 16 个时循环补齐，然后洗牌打乱顺序
```

---

## 七、字体规范

### 7.1 主字体：Quicksand
```css
@font-face {
    font-family: 'Quicksand';
    src: url('/fonts/Quicksand/quicksand-v37-latin-{weight}.woff2');
}
```
支持字重：400, 500, 600, 700

### 7.2 使用场景
| 场景 | 字重 | 字号 |
|------|------|------|
| 页面标题 | 900 | 32-38px |
| 副标题 | 600 | 16px |
| 顶部栏 | 600 | 18px |
| 正文 | 400-500 | 14-16px |

---

## 八、颜色规范

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主文字 | `#0f172a` | 深灰黑 |
| 次要文字 | `#475569` | 中灰 |
| 顶部栏文字 | `#2e2e2e` | 深灰 |
| 主题色 | `#7adfc7` | 薄荷绿 |
| 边框色 | `#111827` | 近黑 |
| 虚线色 | `#b8c0cc` | 浅灰 |
| 背景色 | `#ffffff` | 白色 |
| 浅背景 | `rgba(232,247,244,0.2)` | 淡绿 |

---

## 九、板块开发清单

### 9.1 Literacy（字母技能）
| 板块 ID | 名称 | 状态 | 备注 |
|---------|------|------|------|
| uppercase-tracing | 大写字母描红 | ✅ 完成 | |
| lowercase-tracing | 小写字母描红 | ✅ 完成 | |
| letter-recognition | 字母识别 | ⚠️ 框架完成 | 内容待填充 |

### 9.2 Math（数学技能）
| 板块 ID | 名称 | 状态 | 备注 |
|---------|------|------|------|
| number-tracing | 数字描红 | ✅ 完成 | |
| counting-objects | 数物体 | ✅ 完成 | |
| number-path | 点对点连线 | ✅ 完成 | 调用 Gemini API 生成简笔画 |

### 9.3 Logic（逻辑技能）
| 板块 ID | 名称 | 状态 | 备注 |
|---------|------|------|------|
| maze | 迷宫 | ✅ 完成 | Python 脚本生成 SVG |
| shadow-matching | 影子配对 | ⚠️ 框架完成 | 内容待填充 |
| sorting | 分类排序 | ⚠️ 框架完成 | 内容待填充 |
| pattern-compare | 图案比较 | ⚠️ 框架完成 | 内容待填充 |
| compare | 比较大小 | ⚠️ 框架完成 | 内容待填充 |

---

## 十、代码模板参考

### 10.1 基础页面结构
```typescript
async generateXxxPage(data: any): Promise<string> {
    await this.initialize();
    
    const { theme = 'dinosaur' } = data;
    const themeKey = String(theme).toLowerCase();
    
    // 1. 获取边框贴纸
    const borderImages = getThemeBorders(themeKey, 16);
    // ... 贴纸处理逻辑
    
    // 2. 构建 HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* 基础样式 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 794px; height: 1123px; font-family: 'Quicksand', sans-serif; }
        /* ... 其他样式 */
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">...</div>
        <div class="divider"></div>
        <div class="safe-area">
            <!-- 主内容区域 -->
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
    `;
    
    // 3. 截图保存
    const filename = `xxx-${Date.now()}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const page = await this.browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
    await page.setContent(html);
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: filepath, fullPage: true });
    await page.close();
    
    return `/generated/${filename}`;
}
```

### 10.2 贴纸处理模板
```typescript
// 获取并处理贴纸
const borderImages = getThemeBorders(themeKey, 16);
const borderPool = [...borderImages];
while (borderPool.length < 16) {
    borderPool.push(borderImages[borderPool.length % borderImages.length]);
}
// 洗牌
for (let i = borderPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
}
// 分配左右
const stickersLeft = borderPool.slice(0, 8);
const stickersRight = borderPool.slice(8, 16);
```

---

## 十一、开发新板块流程

1. **确认板块需求**：标题、副标题、内容区布局
2. **选择布局模式**：单图居中 / 网格 / 左右分栏
3. **复制基础模板**：从现有相似板块复制代码
4. **修改内容区**：只改 safe-area 内部的 HTML
5. **测试验证**：调用 API 生成图片检查效果

---

## 十二、与 AI 协作建议

### 12.1 截图标注法
给 AI 发截图时，用红框标注关键区域，并附简短说明：
- "红框1：放迷宫图"
- "红框2：入口图标，需要移到这里"

### 12.2 快速指令
- "按照规范做 XXX 板块" → AI 会参考本文档
- "把 XXX 移到 top: 100px, left: 50px" → 精确位置调整
- "参考 Maze 板块的布局做 YYY" → 复用现有模板

---

*最后更新：2025-12-08*
