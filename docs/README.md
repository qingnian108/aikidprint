<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Kid Print

面向 3-8 岁儿童的 AI 驱动教育工作表生成器。创建个性化的读写、数学和创意活动学习材料，支持自定义主题。

## ✨ 功能特性

### 📚 三大主要分类
- **字母与读写** - 字母描摹、自然拼读、常见词汇和阅读理解
- **数字与数学** - 计数、数字识别、加法、减法和规律
- **艺术与创造** - 涂色页面、绘画提示和创意活动

### 🎯 核心功能
- **分层导航** - 浏览分类 → 选择页面类型 → 配置并生成
- **可自定义参数** - 为每种工作表类型调整难度、主题和页数
- **AI 驱动生成** - 使用 Google Gemini API 进行后端驱动的图像生成
- **PDF 导出** - 下载并打印高质量工作表
- **用户认证** - 使用 Firebase 安全登录（Google 和邮箱）
- **配额管理** - 免费版提供 10 次生成，专业版无限制访问

## 🏗️ 技术栈

- **前端**: React 19, TypeScript, Vite
- **样式**: Tailwind CSS
- **AI**: Google Gemini API
- **认证**: Firebase Auth
- **PDF 生成**: jsPDF, html2canvas
- **图标**: Lucide React
- **路由**: React Router v7

## 📋 前置要求

- Node.js (v18 或更高版本)
- Firebase 账户
- Google Gemini API 密钥

## 🚀 安装配置

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd ai-kid-print
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.example` 到 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

   在 `.env.local` 中填写您的凭据：
   ```env
   # Firebase 配置
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Google Gemini API 密钥
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **设置 Firebase**
   - 在 [Firebase 控制台](https://console.firebase.google.com/) 创建一个 Firebase 项目
   - 启用身份验证（Google 和邮箱/密码）
   - 在 Firebase 身份验证设置中将您的域名添加到授权域名
   - 将您的 Firebase 配置值复制到 `.env.local`

5. **获取 Gemini API 密钥**
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 创建一个 API 密钥
   - 将其作为 `VITE_GEMINI_API_KEY` 添加到 `.env.local`

6. **运行开发服务器**
   ```bash
   npm run dev
   ```

   在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 🏗️ 生产构建

```bash
npm run build
npm run preview
```

## 📁 项目结构

```
ai-kid-print/
├── components/              # 可复用的 React 组件
│   ├── Layout.tsx          # 带导航的主布局
│   ├── WorksheetRenderer.tsx  # 工作表显示组件
│   ├── ErrorBoundary.tsx   # 错误处理包装器
│   ├── ProtectedRoute.tsx  # 认证路由守卫
│   ├── QuotaModal.tsx      # 配额限制通知
│   ├── ConfirmModal.tsx    # 确认对话框
│   ├── SuccessModal.tsx    # 成功通知
│   └── PayPalModal.tsx     # 支付集成
├── pages/                   # 页面组件
│   ├── Home.tsx            # 首页
│   ├── Login.tsx           # 认证页面
│   ├── Dashboard.tsx       # 用户仪表板
│   ├── Pricing.tsx         # 定价和计划
│   ├── FreeResources.tsx   # 免费资源页面
│   ├── Generator.tsx       # 旧版生成器（已弃用）
│   └── generator/          # 新生成器结构
│       ├── GeneratorHome.tsx    # 分类选择
│       ├── CategoryPage.tsx     # 页面类型列表
│       └── GeneratorDetail.tsx  # 配置和生成
├── contexts/               # React 上下文
│   └── AuthContext.tsx    # 认证状态
├── services/              # API 和外部服务
│   ├── firebase.ts        # Firebase 配置
│   ├── geminiService.ts   # AI 生成服务
│   ├── mockApiService.ts  # 测试用模拟 API
│   └── pdfService.ts      # PDF 生成工具
├── constants/             # 应用常量
│   └── generatorConfig.ts # 生成器分类和类型
├── types.ts               # TypeScript 类型定义
├── App.tsx               # 主应用组件和路由
└── index.tsx             # 应用入口点
```

## 🎨 生成器架构

应用使用分层导航结构：

1. **生成器首页** (`/generator`) - 显示三个主要分类
2. **分类页面** (`/generator/:category`) - 列出分类内的可用页面类型
3. **生成器详情** (`/generator/:category/:pageType`) - 配置参数并生成工作表

### 可用页面类型

**字母与读写 (Letters & Literacy)：**
- 大写/小写描红 (Uppercase/Lowercase Tracing)
- 名字定制 (Custom Name Tracing)
- 字母找找看 (Letter Hunt)
- 首字母配对 (Beginning Sounds)
- 字母排序/缺字母 (Alphabet Order)
- 字母+初级单词 (CVC Words)

**数字与数学 (Numbers & Math)：**
- 看图数数 (Count and Write)
- 数字填格 (Number Grid Fill-In)
- 找规律 (Pattern Completion)
- 比较技能 (Comparison Skills)
- 数字描红 (Number Tracing)
- 简单加减图画题 (Picture Math)

**艺术与创造 (Art & Creativity)：**
- 对称画 (Symmetry Drawing)
- 分步简笔画 (Step-by-Step Drawing)
- 创意添画 (Creative Prompts)
- 涂色页生成器 (Coloring Page Mixer)
- 自由涂鸦+图案边框 (Doodle Borders)
- 图案+字母/数字混合页 (Mixed Practice)

## 🔒 安全注意事项

⚠️ **生产环境重要提示：**

1. **需要后端 API**：当前实现使用模拟 API。请替换为实际的后端 API 端点进行图像生成。
2. **配额验证**：将配额检查从客户端移至服务器端（Firebase Functions 或后端 API）。
3. **用户订阅**：实现基于 Firestore 的订阅管理，而不是 localStorage。
4. **API 密钥**：永远不要将 `.env.local` 提交到版本控制。使用特定于环境的配置。
5. **速率限制**：为 API 调用实现服务器端速率限制以防止滥用。
6. **图像存储**：为生成的图像设置适当的云存储（Firebase Storage 或 CDN）。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

MIT 许可证 - 可自由用于个人或商业用途。

## 📚 其他文档

- [Firebase 设置指南](FIREBASE_SETUP.md)
- [GitHub 设置指南](GITHUB_SETUP.md)
- [完整设置指南](SETUP_GUIDE.md)
