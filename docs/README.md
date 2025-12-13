# 🎨 AI Kid Print

**AI-Powered Educational Worksheet Generator for Kids (Ages 3-8)**

面向 3-8 岁儿童的 AI 驱动教育工作表生成器。创建个性化的读写、数学、逻辑思维和创意活动学习材料，支持多种主题。

---

## ✨ 功能特性

### 📚 四大学习板块

1. **Literacy Skills（读写能力）** 🟡
   - Uppercase Letter Tracing - 大写字母描红
   - Lowercase Letter Tracing - 小写字母描红
   - Letter Recognition - 字母识别
   - Write My Name - 名字练习

2. **Math Skills（数学能力）** 🟢
   - Number Tracing - 数字描红
   - Counting Objects - 数数练习
   - Number Path - 数字连线（点对点）

3. **Logic & Thinking（逻辑与思维）** 🔵
   - Maze - 迷宫
   - Shadow Matching - 影子配对
   - Sorting - 分类排序
   - Pattern Compare - 图案比较
   - Pattern Sequencing - 图案序列

4. **Creativity & Motor（创意与运笔）** 🟣
   - Trace Lines - 线条描摹
   - Shape Tracing - 形状描摹
   - Coloring Page - 涂色页
   - Creative Prompt - 创意绘画提示

### 🎯 核心功能

- **Weekly Pack** - 每周学习包，一键生成包含多种类型的综合练习册
- **单页生成器** - 自定义选择分类和页面类型，配置参数后生成
- **6 种主题** - Dinosaur、Space、Ocean、Unicorn、Vehicles、Safari
- **PDF 导出** - 高质量 300 DPI 打印输出（Letter 纸张 8.5" × 11"）
- **用户系统** - Firebase 认证（Google 和邮箱登录）
- **订阅管理** - Free / Pro 计划，Pro 用户无限下载
- **下载历史** - 记录用户的下载历史
- **每周自动发送** - 定时任务自动发送 Weekly Pack 到用户邮箱

---

## 🏗️ 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS (Brutal Design 风格)
- **动画**: Framer Motion
- **路由**: React Router v7
- **状态管理**: Zustand
- **图标**: Lucide React
- **PDF**: jsPDF + html2canvas

### 后端
- **运行时**: Node.js + Express
- **语言**: TypeScript
- **PDF 渲染**: Puppeteer
- **图片处理**: Sharp
- **定时任务**: node-cron
- **邮件服务**: Nodemailer
- **AI 图像**: Google Imagen API

### 基础设施
- **认证**: Firebase Auth
- **数据库**: Firebase Firestore
- **存储**: Firebase Storage

---

## 📁 项目结构

```
ai-kid-print/
├── src/                          # 前端源码
│   ├── components/               # 可复用组件
│   │   ├── Layout.tsx           # 主布局（固定头部导航）
│   │   ├── PrintSettings.tsx    # 打印设置
│   │   ├── WeeklyDeliverySettings.tsx  # 每周发送设置
│   │   ├── DownloadHistory.tsx  # 下载历史
│   │   └── ...
│   ├── pages/                    # 页面组件
│   │   ├── Home.tsx             # 首页
│   │   ├── DashboardNew.tsx     # 用户仪表板
│   │   ├── Pricing.tsx          # 定价页面
│   │   ├── WeeklyPack.tsx       # Weekly Pack 配置
│   │   ├── WeeklyPackPreview.tsx # Weekly Pack 预览
│   │   └── generator/           # 单页生成器
│   │       ├── GeneratorHome.tsx    # 分类选择（2x2 布局）
│   │       ├── CategoryPage.tsx     # 页面类型列表
│   │       └── GeneratorDetail.tsx  # 配置和生成
│   ├── constants/
│   │   └── pageTypes.ts         # 分类和页面类型定义
│   ├── contexts/
│   │   └── AuthContext.tsx      # 认证上下文
│   ├── services/
│   │   ├── api.ts               # 后端 API 调用
│   │   ├── firestoreService.ts  # Firestore 操作
│   │   └── firebase.ts          # Firebase 配置
│   └── App.tsx                  # 路由配置
│
├── backend/                      # 后端源码
│   ├── src/
│   │   ├── index.ts             # Express 入口
│   │   ├── routes/
│   │   │   ├── worksheets.ts    # 工作表 API
│   │   │   ├── weeklyPack.ts    # Weekly Pack API
│   │   │   └── weeklyDelivery.ts # 每周发送 API
│   │   ├── services/
│   │   │   ├── generators/      # 各类型生成器
│   │   │   │   ├── index.ts     # 生成器映射
│   │   │   │   ├── weeklyPackService.ts
│   │   │   │   ├── dotToDotService.ts
│   │   │   │   └── patternCompareService.ts
│   │   │   ├── worksheetService.ts
│   │   │   ├── pdfGenerator.ts  # Puppeteer PDF 生成
│   │   │   ├── imageGenerator.ts
│   │   │   ├── imagenService.ts # Google Imagen API
│   │   │   ├── cronService.ts   # 定时任务
│   │   │   └── emailService.ts  # 邮件发送
│   │   └── utils/
│   │       └── imageHelper.ts   # 图片工具函数
│   └── public/                  # 静态资源
│       ├── fonts/               # 字体文件
│       ├── uploads/             # 主题图片资源
│       ├── generated/           # 生成的文件
│       └── previews/            # 预览图
│
├── scripts/                      # Python 脚本
│   ├── maze_generator.py        # 迷宫生成
│   └── dot_to_dot.py            # 点对点处理
│
└── docs/                         # 文档
    ├── README.md
    ├── SETUP_GUIDE.md
    ├── FIREBASE_SETUP.md
    └── GOOGLE_IMAGEN_API.md
```

---

## 🚀 快速开始

### 前置要求
- Node.js v18+
- Python 3.x（用于迷宫和点对点生成）
- Firebase 账户
- Google Cloud 账户（Imagen API）

### 1. 克隆项目
```bash
git clone https://github.com/qingnian108/aikidprint.git
cd aikidprint
```

### 2. 安装依赖
```bash
# 前端依赖
npm install

# 后端依赖
cd backend
npm install
```

### 3. 配置环境变量

**前端 `.env.local`:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3000
```

**后端 `backend/.env`:**
```env
PORT=3000
PYTHON_PATH=python

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Google Imagen API
GOOGLE_CLOUD_PROJECT=your_gcp_project
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password

# Cron
ENABLE_CRON=false
CRON_TIMEZONE=America/New_York
```

### 4. 启动开发服务器

```bash
# 终端 1 - 后端
cd backend
npm run dev

# 终端 2 - 前端
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3000

---

## 📡 API 端点

### 工作表生成
- `POST /api/worksheets/generate` - 生成单页工作表
- `POST /api/worksheets/generate-pdf` - 生成 PDF

### Weekly Pack
- `POST /api/weekly-pack/generate` - 生成 Weekly Pack
- `POST /api/weekly-pack/generate-pdf` - 生成 Weekly Pack PDF

### 每周发送
- `POST /api/weekly-delivery/settings` - 保存发送设置
- `GET /api/weekly-delivery/settings/:userId` - 获取发送设置

---

## 🎨 主题系统

支持 6 种儿童喜爱的主题：
- 🦕 **Dinosaur** - 恐龙
- 🚀 **Space** - 太空
- 🌊 **Ocean** - 海洋
- 🦄 **Unicorn** - 独角兽
- 🚗 **Vehicles** - 交通工具
- 🦁 **Safari** - 野生动物

每个主题包含对应的装饰图片，存放在 `backend/public/uploads/{theme}/` 目录。

---

## 📄 许可证

MIT License

