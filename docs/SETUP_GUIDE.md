# AI Kid Print - 详细设置指南

## 环境变量配置

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 获取 Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 点击项目设置（齿轮图标）
4. 在"常规"标签下，找到"您的应用"部分
5. 如果还没有 Web 应用，点击"添加应用"并选择 Web（</>）
6. 复制 Firebase 配置对象中的值到 `.env.local`：

```javascript
// Firebase Console 显示的配置
const firebaseConfig = {
  apiKey: "AIzaSy...",           // → VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",              // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456",   // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456:web:abc",     // → VITE_FIREBASE_APP_ID
  measurementId: "G-XXXXXXX"     // → VITE_FIREBASE_MEASUREMENT_ID
};
```

### 3. 启用 Firebase Authentication

1. 在 Firebase Console 中，进入"Authentication"
2. 点击"Get Started"
3. 在"Sign-in method"标签下，启用以下登录方式：
   - **Google** - 点击启用，选择项目支持邮箱
   - **Email/Password** - 点击启用

4. 在"Settings"标签下，添加授权域名：
   - 开发环境：`localhost`
   - 生产环境：添加你的部署域名

### 4. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的 Google 账号
3. 点击"Create API Key"
4. 选择或创建一个 Google Cloud 项目
5. 复制生成的 API Key
6. 将其添加到 `.env.local` 作为 `VITE_GEMINI_API_KEY`

**注意**: Gemini API 可能需要启用计费账户。访问 [Google Cloud Console](https://console.cloud.google.com/) 设置。

### 5. 验证配置

完成后，你的 `.env.local` 应该类似这样：

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Gemini API Key
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 常见问题

### Q: Firebase 登录失败，显示 "unauthorized-domain"
**A**: 在 Firebase Console → Authentication → Settings → Authorized domains 中添加你的域名。

### Q: Gemini API 调用失败
**A**: 
1. 检查 API Key 是否正确
2. 确认 Google Cloud 项目已启用 Gemini API
3. 检查是否有计费账户（某些功能需要）

### Q: 环境变量不生效
**A**: 
1. 确保文件名是 `.env.local`（不是 `.env`）
2. 重启开发服务器（`npm run dev`）
3. 确认变量名以 `VITE_` 开头

### Q: TypeScript 报错找不到环境变量
**A**: 已在 `vite-env.d.ts` 中定义类型。如果仍有问题，重启 VS Code。

## 安全最佳实践

1. ✅ **永远不要提交 `.env.local` 到 Git**
   - 已在 `.gitignore` 中排除
   
2. ✅ **使用不同的 API Keys 用于开发和生产**
   
3. ✅ **定期轮换 API Keys**
   
4. ✅ **在 Firebase 中设置使用配额和预算警报**

5. ✅ **生产环境使用服务器端验证**
   - 当前配额检查在客户端，仅用于演示
   - 生产环境应使用 Firebase Functions 或后端 API

## 下一步

配置完成后：

1. 运行开发服务器：`npm run dev`
2. 访问 http://localhost:5173
3. 测试注册/登录功能
4. 尝试生成工作表

如有问题，请查看浏览器控制台和终端输出的错误信息。
