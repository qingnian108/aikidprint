# Implementation Plan

## Phase 1: 项目初始化和基础架构

- [ ] 1. 创建 React Native 项目





  - [ ] 1.1 初始化 React Native 项目
    - 使用 `npx react-native init AIKidPrint --template react-native-template-typescript`


    - 配置 Android 项目名称和包名
    - _Requirements: 1.1, 1.2_
  - [ ] 1.2 安装核心依赖
    - 安装 React Navigation: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`


    - 安装状态管理: `zustand`




    - 安装网络请求: `axios`
    - 安装存储: `@react-native-async-storage/async-storage`


    - _Requirements: 1.3_
  - [x] 1.3 配置项目结构


    - 创建 src/components, src/screens, src/services, src/stores, src/theme, src/types 目录
    - 创建基础类型定义文件
    - _Requirements: 1.2_



- [ ] 2. 实现主题和设计系统
  - [x] 2.1 创建颜色和主题配置




    - 定义品牌色彩常量 (duck-yellow, duck-blue, duck-green, duck-orange, duck-pink)
    - 定义间距和圆角常量


    - _Requirements: 2.2_
  - [x] 2.2 配置字体


    - 下载并配置 Quicksand 字体
    - 创建 typography 配置


    - _Requirements: 2.5_




  - [ ] 2.3 创建 Brutal 风格基础组件
    - 实现 BrutalButton 组件（粗边框、阴影效果）
    - 实现 BrutalCard 组件（圆角、边框）


    - 实现 BrutalInput 组件


    - _Requirements: 2.1, 2.3, 2.4_

- [x] 3. Checkpoint - 确保基础架构正常




  - 确保所有测试通过，如有问题询问用户

## Phase 2: 认证功能



- [x] 4. 配置 Firebase


  - [x] 4.1 安装 Firebase 依赖



    - 安装 `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`
    - 配置 Android google-services.json
    - _Requirements: 3.1_


  - [x] 4.2 实现认证服务


    - 创建 services/auth.ts
    - 实现 Google 登录、邮箱登录、登出功能
    - _Requirements: 3.2, 3.3, 3.5_




  - [ ] 4.3 实现认证状态管理
    - 创建 stores/authStore.ts
    - 实现用户状态、登录、登出 actions




    - _Requirements: 3.1, 3.4_
  - [ ] 4.4 编写认证状态属性测试
    - **Property 1: 认证状态导航一致性**




    - **Validates: Requirements 3.1, 3.4**



- [ ] 5. 实现登录界面
  - [x] 5.1 创建 LoginScreen


    - 实现 Google 登录按钮
    - 实现邮箱/密码表单

    - 实现错误提示

    - _Requirements: 3.2, 3.3, 3.6_



  - [-] 5.2 编写认证失败属性测试

    - **Property 2: 认证失败错误显示**



    - **Validates: Requirements 3.6**





- [x] 6. Checkpoint - 确保认证功能正常



  - 确保所有测试通过，如有问题询问用户

## Phase 3: 导航和首页







- [ ] 7. 实现导航结构
  - [x] 7.1 创建导航配置


    - 创建 AuthNavigator（未登录导航）

    - 创建 TabNavigator（底部标签导航）

    - 创建 AppNavigator（根导航）
    - _Requirements: 4.1_


  - [ ] 7.2 实现底部标签栏
    - 创建 Home、Weekly Pack、Custom Pack、Profile 四个标签
    - 配置标签图标和样式






    - _Requirements: 4.1, 4.2_
  - [-] 7.3 编写导航属性测试



    - **Property 3: Tab 导航正确性**
    - **Validates: Requirements 4.2**

- [x] 8. 实现首页




  - [ ] 8.1 创建 HomeScreen
    - 实现快捷操作卡片（Weekly Pack、Custom Pack）


    - 实现最近下载列表（已登录用户）
    - _Requirements: 4.3, 4.4_
  - [x] 8.2 编写首页属性测试


    - **Property 4: 登录用户历史显示**
    - **Validates: Requirements 4.4**


- [ ] 9. Checkpoint - 确保导航和首页正常
  - 确保所有测试通过，如有问题询问用户



## Phase 4: Weekly Pack 功能

- [x] 10. 实现 API 服务



  - [-] 10.1 创建 API 服务

    - 创建 services/api.ts
    - 实现 generateWeeklyPack、saveWeeklyPack、getWeeklyPack 方法


    - 配置 API_BASE_URL
    - _Requirements: 5.4_


- [x] 11. 实现 Weekly Pack 状态管理




  - [ ] 11.1 创建 packStore
    - 实现 childName、age、theme 状态


    - 实现 generatedPages、isGenerating 状态
    - 实现 generateWeeklyPack action


    - _Requirements: 5.1, 5.4_



- [ ] 12. 实现 Weekly Pack 界面
  - [ ] 12.1 创建选择器组件
    - 实现 AgeSelector 组件

    - 实现 ThemeSelector 组件

    - _Requirements: 5.2, 5.3_
  - [ ] 12.2 编写选择器属性测试
    - **Property 5: 年龄选择状态**

    - **Property 6: 主题选择状态**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 12.3 创建 WeeklyPackScreen

    - 实现姓名输入、年龄选择、主题选择
    - 实现生成按钮和加载状态
    - _Requirements: 5.1, 5.5_
  - [x] 12.4 编写生成流程属性测试

    - **Property 7: 生成成功导航**
    - **Property 8: 生成失败错误处理**
    - **Validates: Requirements 5.6, 5.7**


- [x] 13. 实现加载动画

  - [ ] 13.1 创建 LoadingOverlay 组件
    - 实现全屏加载动画
    - 显示生成进度提示
    - _Requirements: 5.5_


- [x] 14. Checkpoint - 确保 Weekly Pack 功能正常

  - 确保所有测试通过，如有问题询问用户

## Phase 5: Custom Pack 功能



- [ ] 15. 扩展 API 服务
  - [ ] 15.1 添加 Custom Pack API
    - 实现 generateCustomPack、getCustomPack 方法

    - _Requirements: 6.4_

- [ ] 16. 扩展状态管理
  - [ ] 16.1 扩展 packStore
    - 添加 selections 状态

    - 实现 setQuantity、generateCustomPack actions
    - _Requirements: 6.3_
  - [x] 16.2 编写数量计算属性测试

    - **Property 10: 页面数量计算**
    - **Validates: Requirements 6.3**


- [x] 17. 实现 Custom Pack 界面

  - [x] 17.1 创建 CategorySelector 组件


    - 实现分类展开/收起

    - 实现页面类型数量选择器
    - _Requirements: 6.1, 6.2_
  - [x] 17.2 编写分类展开属性测试

    - **Property 9: 分类展开显示**
    - **Validates: Requirements 6.2**
  - [x] 17.3 创建 CustomPackScreen

    - 实现主题选择
    - 实现分类和页面类型选择
    - 实现生成按钮
    - _Requirements: 6.1, 6.4_


- [ ] 18. Checkpoint - 确保 Custom Pack 功能正常
  - 确保所有测试通过，如有问题询问用户

## Phase 6: 预览和下载功能

- [ ] 19. 实现预览界面
  - [ ] 19.1 创建 PageGrid 组件
    - 实现页面缩略图网格
    - 实现点击放大功能
    - _Requirements: 7.1, 7.2_
  - [ ] 19.2 编写预览属性测试
    - **Property 11: 预览页面完整性**
    - **Property 12: 页面详情显示**
    - **Validates: Requirements 7.1, 7.3**
  - [ ] 19.3 创建 PreviewScreen
    - 实现页面网格预览
    - 实现全屏查看模式
    - 实现左右滑动切换
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 20. 实现 PDF 下载功能
  - [ ] 20.1 安装 PDF 依赖
    - 安装 `react-native-pdf-lib` 或 `react-native-html-to-pdf`
    - 配置文件系统权限
    - _Requirements: 8.1_
  - [ ] 20.2 创建 PDF 服务
    - 创建 services/pdf.ts
    - 实现 generatePDF 方法
    - 实现文件保存功能
    - _Requirements: 8.1, 8.2_
  - [ ] 20.3 编写下载权限属性测试
    - **Property 13: Pro 用户下载权限**
    - **Property 14: 下载失败错误处理**
    - **Validates: Requirements 8.1, 8.4, 8.5**
  - [ ] 20.4 实现下载按钮逻辑
    - Pro 用户：生成并下载 PDF
    - Free 用户：跳转升级页面
    - 显示下载成功/失败提示
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 21. Checkpoint - 确保预览和下载功能正常
  - 确保所有测试通过，如有问题询问用户

## Phase 7: Dashboard 和设置

- [ ] 22. 实现 Dashboard
  - [ ] 22.1 创建 DashboardScreen
    - 显示用户订阅状态
    - 显示下载统计
    - 显示下载历史列表
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 22.2 编写 Dashboard 属性测试
    - **Property 15: Dashboard 统计显示**
    - **Property 16: 下载历史列表**
    - **Validates: Requirements 9.2, 9.3**
  - [ ] 22.3 实现历史项点击
    - 点击历史项跳转到预览页面
    - _Requirements: 9.4_

- [ ] 23. 实现打印设置
  - [ ] 23.1 创建 settingsStore
    - 实现 paperSize 状态
    - 实现 detectPaperSize 方法（基于设备 locale）
    - _Requirements: 13.1, 13.4_
  - [ ] 23.2 编写设置属性测试
    - **Property 18: 纸张大小持久化**
    - **Property 19: 纸张大小自动检测**
    - **Validates: Requirements 13.2, 13.3, 13.4**
  - [ ] 23.3 创建 SettingsScreen
    - 实现纸张大小选择（Letter/A4）
    - 保存设置到 AsyncStorage 和 Firebase
    - _Requirements: 13.1, 13.2_

- [ ] 24. Checkpoint - 确保 Dashboard 和设置功能正常
  - 确保所有测试通过，如有问题询问用户

## Phase 8: 订阅和支付

- [ ] 25. 实现订阅功能
  - [ ] 25.1 安装支付依赖
    - 安装 `react-native-iap`
    - 配置 Google Play Console 产品
    - _Requirements: 10.1_
  - [ ] 25.2 创建支付服务
    - 创建 services/payment.ts
    - 实现 initConnection、purchaseSubscription 方法
    - _Requirements: 10.2_
  - [ ] 25.3 创建 PricingScreen
    - 显示 Pro 计划权益
    - 实现订阅按钮
    - 处理支付结果
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 26. Checkpoint - 确保订阅功能正常
  - 确保所有测试通过，如有问题询问用户

## Phase 9: 离线支持和推送通知

- [ ] 27. 实现离线缓存
  - [ ] 27.1 创建缓存服务
    - 创建 services/cache.ts
    - 实现图片缓存功能
    - 实现离线数据存储
    - _Requirements: 11.1_
  - [ ] 27.2 编写离线缓存属性测试
    - **Property 17: 离线缓存可用性**
    - **Validates: Requirements 11.1, 11.2**
  - [ ] 27.3 实现离线模式
    - 检测网络状态
    - 离线时显示缓存数据
    - _Requirements: 11.2, 11.3_

- [ ] 28. 实现推送通知
  - [ ] 28.1 配置 FCM
    - 安装 `@react-native-firebase/messaging`
    - 配置 Android 通知权限
    - _Requirements: 12.1_
  - [ ] 28.2 实现通知处理
    - 注册 FCM token
    - 处理前台/后台通知
    - 实现通知点击跳转
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 29. Checkpoint - 确保离线和通知功能正常
  - 确保所有测试通过，如有问题询问用户

## Phase 10: 最终测试和发布准备

- [ ] 30. 完整功能测试
  - [ ] 30.1 运行所有单元测试
    - 确保所有属性测试通过
    - 修复发现的问题
  - [ ] 30.2 进行 E2E 测试
    - 测试完整用户流程
    - 测试边界情况

- [ ] 31. 发布准备
  - [ ] 31.1 配置发布签名
    - 生成 release keystore
    - 配置 gradle 签名
    - _Requirements: 1.4_
  - [ ] 31.2 构建 Release APK
    - 运行 `./gradlew assembleRelease`
    - 验证 APK 功能
    - _Requirements: 1.4_
  - [ ] 31.3 准备 Google Play 上架材料
    - 准备应用图标和截图
    - 编写应用描述
    - 配置隐私政策链接

- [ ] 32. 最终检查点
  - 确保所有测试通过，如有问题询问用户
