# GitHub 上传指南

## 已完成步骤

✅ 初始化Git仓库  
✅ 创建.gitignore文件  
✅ 提交代码到本地仓库  

## 接下来需要您手动完成的步骤

### 1. 添加远程仓库

在命令行中运行以下命令（替换YOUR_USERNAME为您的GitHub用户名）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-kid-print.git
git branch -M main
git push -u origin main
```

### 2. 如果您还没有创建GitHub仓库

1. 访问 [GitHub](https://github.com/)
2. 登录您的账户
3. 点击右上角的"+"图标，选择"New repository"
4. 填写仓库信息：
   - Repository name: `ai-kid-print`
   - Description: `AI-powered children's worksheet generator`
   - 选择"Public"（公开）或"Private"（私有）
   - **不要**勾选"Add a README file"
5. 点击"Create repository"
6. 复制仓库URL，然后运行上面的命令

### 3. 如果您已有GitHub仓库

1. 访问您的GitHub仓库页面
2. 点击"Code"按钮
3. 复制HTTPS URL
4. 运行上面的命令，将YOUR_USERNAME替换为正确的URL

## 常见问题

### 问题1：提示输入用户名和密码
- 如果使用HTTPS，您需要输入GitHub用户名和密码（或个人访问令牌）
- 推荐使用个人访问令牌：https://github.com/settings/tokens

### 问题2：推送失败
- 确保您有仓库的写入权限
- 检查URL是否正确

### 问题3：需要身份验证
- 如果启用了双因素认证，您需要使用个人访问令牌而不是密码

## 完成后

上传成功后，您就可以在GitHub上查看您的代码，并分享给其他人了！
