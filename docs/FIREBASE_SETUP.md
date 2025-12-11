# Firebase 身份验证设置指南

## 步骤1：创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如：ai-kid-print）
4. 选择是否启用Google Analytics（可选）
5. 点击"创建项目"

## 步骤2：启用身份验证服务

1. 在Firebase控制台中，选择您的项目
2. 在左侧菜单中，点击"Authentication"（身份验证）
3. 点击"开始使用"按钮
4. 在"登录方法"标签页中，启用以下登录方式：
   - **Google**：启用并设置支持电子邮件
   - **电子邮件/密码**：启用

## 步骤3：获取Firebase配置信息

1. 在Firebase控制台中，点击项目设置图标（齿轮图标）
2. 选择"项目设置"
3. 在"您的应用"部分，点击Web应用图标（</>）
4. 输入应用名称（例如：AI Kid Print）
5. 点击"注册应用"
6. 复制Firebase配置信息（firebaseConfig对象）

## 步骤4：更新Firebase配置

1. 打开 `services/firebase.ts` 文件
2. 将复制的配置信息替换掉现有的占位符配置：

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 步骤5：测试登录功能

1. 重新启动开发服务器：
   ```bash
   npm run dev
   ```

2. 在浏览器中打开 http://localhost:3000

3. 点击导航栏中的"Log In"按钮

4. 测试登录功能：
   - **Google登录**：点击"使用谷歌账户登录"按钮
   - **邮箱登录**：输入邮箱和密码，点击"登录"或"注册"

5. 登录成功后，您应该能够：
   - 在导航栏看到您的用户名
   - 访问仪表板页面（/dashboard）
   - 使用登出功能

## 常见问题

### 问题1：Google登录失败
- 确保在Firebase控制台中已启用Google登录
- 检查您的域名是否已添加到授权域名列表中（localhost默认已添加）

### 问题2：邮箱注册失败
- 确保在Firebase控制台中已启用电子邮件/密码登录
- 检查密码是否符合要求（至少6个字符）

### 问题3：配置错误
- 确保Firebase配置信息正确复制
- 检查是否有拼写错误

## 下一步

登录功能实现后，您可以：
1. 在仪表板页面添加用户特定功能
2. 保存用户的练习册历史记录
3. 实现用户订阅和付费功能

如有任何问题，请查看浏览器控制台的错误信息。
