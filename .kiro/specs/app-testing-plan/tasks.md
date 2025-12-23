# Implementation Plan

## 测试执行任务

- [x] 1. 后端服务启动测试




  - [ ] 1.1 启动后端服务并验证健康检查
    - 运行 `npm run dev` 在 backend 目录
    - 访问 http://localhost:3000/health 验证返回 `{"status":"ok"}`




    - 访问 http://localhost:3000/api/hello 验证返回欢迎消息
    - _Requirements: 2.1, 2.2, 2.3_



- [ ] 2. 前端应用启动测试
  - [ ] 2.1 启动前端服务并验证首页加载
    - 运行 `npm run dev` 在根目录
    - 访问 http://localhost:5173 验证首页正常显示




    - 检查浏览器控制台无 JavaScript 错误
    - _Requirements: 1.1_
  - [ ] 2.2 验证所有路由可访问
    - 测试 `/weekly-pack` 页面


    - 测试 `/custom-pack` 页面
    - 测试 `/generator` 页面
    - 测试 `/pricing` 页面




    - _Requirements: 1.2_

- [ ] 3. Weekly Pack 功能测试
  - [ ] 3.1 测试 Weekly Pack 生成流程
    - 访问 `/weekly-pack` 页面

    - 输入孩子名字、选择年龄组、选择主题
    - 点击生成按钮
    - 验证 API 调用成功，所有页面图片加载




    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 3.2 测试 Weekly Pack PDF 下载


    - 在预览页面点击下载 PDF
    - 验证 PDF 文件下载成功
    - 检查 PDF 页面数量和顺序正确



    - _Requirements: 3.4, 6.3, 6.4_

- [ ] 4. Custom Pack 功能测试
  - [x] 4.1 测试 Custom Pack 生成流程

    - 访问 `/custom-pack` 页面
    - 选择主题
    - 选择多个页面类型并设置数量
    - 点击生成按钮
    - 验证生成的页面数量等于选择的总数
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.2 测试 Custom Pack PDF 下载








    - 在预览页面点击下载 PDF
    - 验证 PDF 文件下载成功
    - _Requirements: 6.3, 6.4_


- [ ] 5. 图片生成服务测试
  - [x] 5.1 验证图片生成尺寸

    - 生成一个练习页面
    - 检查生成的图片尺寸为 816x1056 像素
    - _Requirements: 5.1, 5.2_




  - [ ] 5.2 验证主题资源加载
    - 选择不同主题生成页面
    - 检查主题图标正确加载
    - 验证图标路径格式正确

    - _Requirements: 5.3, 9.1, 9.2_

- [x] 6. PDF 纸张大小测试




  - [ ] 6.1 测试 Letter 纸张大小
    - 设置纸张大小为 Letter

    - 下载 PDF
    - 验证图片填满宽度，无左右空白
    - _Requirements: 6.1_



  - [-] 6.2 测试 A4 纸张大小

    - 设置纸张大小为 A4
    - 下载 PDF

    - 验证图片填满高度，左右均匀裁剪
    - _Requirements: 6.2_



- [ ] 7. 纸张大小自动检测测试
  - [ ] 7.1 验证时区检测逻辑
    - 检查 `detectPaperSizeByTimezone()` 函数
    - 验证美洲时区返回 'letter'
    - 验证欧洲/亚洲时区返回 'a4'
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. 用户认证功能测试
  - [ ] 8.1 测试登录流程
    - 访问 `/login` 页面
    - 使用 Firebase 认证登录
    - 验证登录成功后跳转到 Dashboard
    - _Requirements: 7.1, 7.2_
  - [ ] 8.2 测试受保护路由
    - 未登录状态访问 `/dashboard`
    - 验证重定向到登录页面
    - _Requirements: 7.3_
  - [ ] 8.3 测试登出功能
    - 登录状态下点击登出
    - 验证会话清除并跳转到首页
    - _Requirements: 7.4_

- [ ] 9. 移动端兼容性测试
  - [ ] 9.1 测试响应式布局
    - 使用 Chrome DevTools 模拟移动设备
    - 测试 iPhone SE (375px) 视口
    - 测试 iPad (768px) 视口
    - 验证无水平滚动条
    - _Requirements: 10.1_
  - [ ] 9.2 测试触摸交互
    - 模拟触摸点击按钮
    - 验证表单输入正常
    - _Requirements: 10.2_

- [ ] 10. 错误处理测试
  - [ ] 10.1 测试 API 错误处理
    - 模拟后端服务关闭
    - 验证前端显示错误提示
    - _Requirements: 2.4, 5.4_
  - [ ] 10.2 测试图片加载失败处理
    - 模拟图片 URL 无效
    - 验证显示占位图或错误提示
    - _Requirements: 9.3_

- [ ] 11. Capacitor 兼容性检查
  - [ ] 11.1 检查浏览器 API 使用
    - 检查是否使用 localStorage (Capacitor 兼容)
    - 检查是否使用 window.location (需要调整)
    - 检查是否使用 document.cookie (需要调整)
    - _Requirements: 10.3_
  - [ ] 11.2 检查 API 地址配置
    - 确认 API 地址可配置为环境变量
    - 确认不使用 localhost 硬编码
    - _Requirements: 10.3_

- [ ] 12. 最终检查点
  - 确保所有测试通过，如有问题询问用户
