# Design Document: AI Kid Print 测试规划

## Overview

本设计文档定义了 AI Kid Print 网站在转换为移动端应用之前的全面测试策略。测试将覆盖前端、后端、API 集成、图片生成、PDF 导出等核心功能，确保现有功能正常运行并为 Capacitor 移动端迁移做好准备。

## Architecture

### 测试架构

```
┌─────────────────────────────────────────────────────────────┐
│                      测试层级                                │
├─────────────────────────────────────────────────────────────┤
│  E2E 测试 (手动)                                            │
│  - 完整用户流程测试                                          │
│  - 跨浏览器兼容性                                            │
│  - 移动端响应式测试                                          │
├─────────────────────────────────────────────────────────────┤
│  集成测试                                                    │
│  - API 端点测试                                              │
│  - 前后端数据流测试                                          │
│  - 图片生成服务测试                                          │
├─────────────────────────────────────────────────────────────┤
│  单元测试                                                    │
│  - 工具函数测试                                              │
│  - 组件渲染测试                                              │
│  - 数据生成器测试                                            │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **前端测试**: Vitest + React Testing Library
- **后端测试**: 手动 API 测试 (curl/Postman)
- **E2E 测试**: 手动测试清单

## Components and Interfaces

### 1. 前端组件

| 组件 | 路径 | 测试重点 |
|------|------|----------|
| Home | `/` | 页面加载、导航链接 |
| WeeklyPack | `/weekly-pack` | 表单提交、API 调用 |
| CustomPack | `/custom-pack` | 多选功能、状态管理 |
| WeeklyPackPreview | `/weekly-pack/preview/:id` | 图片加载、PDF 下载 |
| CustomPackPreview | `/custom-pack/preview/:id` | 图片加载、PDF 下载 |
| Generator | `/generator` | 分类导航、生成功能 |
| Dashboard | `/dashboard` | 认证保护、用户数据 |

### 2. 后端 API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/hello` | GET | 欢迎消息 |
| `/api/weekly-pack/generate-pages` | POST | 生成周练习册页面 |
| `/api/weekly-pack/save` | POST | 保存练习册 |
| `/api/weekly-pack/pack/:packId` | GET | 获取练习册 |
| `/api/custom-pack/generate` | POST | 生成自定义练习册 |
| `/api/custom-pack/:packId` | GET | 获取自定义练习册 |
| `/api/worksheets/generate-image` | POST | 生成单页图片 |

### 3. 核心服务

| 服务 | 文件 | 功能 |
|------|------|------|
| ImageGenerator | `backend/src/services/imageGenerator.ts` | Puppeteer 图片渲染 |
| PDF Generator | `src/utils/pdfGenerator.ts` | 前端 PDF 生成 |
| Firestore Service | `src/services/firestoreService.ts` | 用户数据、设置 |
| Auth Context | `src/contexts/AuthContext.tsx` | Firebase 认证 |

## Data Models

### 测试数据模型

```typescript
// Weekly Pack 测试数据
interface WeeklyPackTestData {
  childName: string;
  age: '3-4' | '4-5' | '5-6';
  theme: 'dinosaur' | 'unicorn' | 'space' | 'ocean' | 'safari';
}

// Custom Pack 测试数据
interface CustomPackTestData {
  theme: string;
  selections: Record<string, number>;
}

// API 响应验证
interface APIResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// 纸张大小
type PaperSize = 'letter' | 'a4';
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 路由渲染一致性
*For any* valid route in the application, navigating to that route SHALL render the corresponding page component without errors.
**Validates: Requirements 1.2**

### Property 2: API 错误响应格式
*For any* failed API request, the system SHALL return a response containing an error field with a descriptive message.
**Validates: Requirements 2.4**

### Property 3: 生成页面完整性
*For any* weekly pack generation request with valid parameters, all configured page types SHALL be generated and returned.
**Validates: Requirements 3.3**

### Property 4: 自定义包页面数量
*For any* custom pack generation request, the number of generated pages SHALL equal the sum of all selection counts.
**Validates: Requirements 4.3, 4.4**

### Property 5: 图片尺寸一致性
*For any* generated worksheet image, the dimensions SHALL be 816x1056 pixels (Letter ratio).
**Validates: Requirements 5.2**

### Property 6: 主题资源路径格式
*For any* theme selection, the theme icon path SHALL follow the format `/uploads/assets/B_character_ip/{theme}/icon/{theme}_icon.png`.
**Validates: Requirements 9.1**

### Property 7: PDF 页面顺序
*For any* multi-page PDF generation, the pages SHALL appear in the same order as the source images array.
**Validates: Requirements 6.3**

### Property 8: 时区纸张大小检测
*For any* Americas timezone, the detected paper size SHALL be 'letter'; for any other timezone, it SHALL be 'a4'.
**Validates: Requirements 8.1, 8.2**

### Property 9: 认证路由保护
*For any* protected route accessed without authentication, the system SHALL redirect to the login page.
**Validates: Requirements 7.3**

### Property 10: 响应式布局
*For any* viewport width between 320px and 1920px, the application SHALL display without horizontal scrolling.
**Validates: Requirements 10.1**

## Error Handling

### 错误类型和处理策略

| 错误类型 | 处理方式 | 用户反馈 |
|----------|----------|----------|
| API 请求失败 | 显示错误模态框 | "生成失败，请重试" |
| 图片加载失败 | 显示占位图 | 灰色占位符 |
| PDF 生成失败 | 捕获异常 | "下载失败，请重试" |
| 认证失败 | 重定向登录 | 登录页面 |
| 网络超时 | 重试机制 | "网络连接问题" |

## Testing Strategy

### 1. 手动测试清单

#### 前端启动测试
- [ ] 运行 `npm run dev` 启动前端
- [ ] 访问 http://localhost:5173 确认首页加载
- [ ] 检查控制台无 JavaScript 错误
- [ ] 测试所有导航链接

#### 后端 API 测试
- [ ] 运行 `npm run dev` 启动后端 (backend 目录)
- [ ] 测试 GET /health 返回 200
- [ ] 测试 GET /api/hello 返回欢迎消息
- [ ] 测试 POST /api/weekly-pack/generate-pages
- [ ] 测试 POST /api/custom-pack/generate

#### Weekly Pack 功能测试
- [ ] 选择年龄组和主题
- [ ] 点击生成按钮
- [ ] 验证所有页面图片加载
- [ ] 测试 PDF 下载 (Letter)
- [ ] 测试 PDF 下载 (A4)

#### Custom Pack 功能测试
- [ ] 选择多个页面类型
- [ ] 调整每种类型数量
- [ ] 生成自定义包
- [ ] 验证页面数量正确
- [ ] 测试 PDF 下载

#### 认证功能测试
- [ ] 测试登录流程
- [ ] 测试登出流程
- [ ] 测试受保护路由重定向
- [ ] 测试 Dashboard 访问

#### 移动端兼容性测试
- [ ] Chrome DevTools 移动端模拟
- [ ] 测试 iPhone SE (375px)
- [ ] 测试 iPad (768px)
- [ ] 测试触摸交互

### 2. 自动化测试 (Vitest)

```typescript
// 测试文件结构
src/
  test/
    setup.ts              // 测试配置
  services/
    firestoreService.test.ts  // 纸张大小检测测试
  utils/
    pdfGenerator.test.ts      // PDF 生成测试
  components/
    Layout.test.tsx           // 布局组件测试
```

### 3. API 测试命令

```bash
# 健康检查
curl http://localhost:3000/health

# Hello API
curl http://localhost:3000/api/hello

# Weekly Pack 生成
curl -X POST http://localhost:3000/api/weekly-pack/generate-pages \
  -H "Content-Type: application/json" \
  -d '{"childName":"Test","age":"4-5","theme":"dinosaur"}'

# Custom Pack 生成
curl -X POST http://localhost:3000/api/custom-pack/generate \
  -H "Content-Type: application/json" \
  -d '{"theme":"dinosaur","selections":{"uppercase-tracing":1}}'
```

### 4. 测试优先级

| 优先级 | 测试项 | 原因 |
|--------|--------|------|
| P0 | 后端 API 启动 | 核心功能依赖 |
| P0 | 图片生成服务 | 核心功能 |
| P0 | PDF 下载功能 | 用户核心需求 |
| P1 | 认证功能 | 用户数据安全 |
| P1 | 纸张大小检测 | 用户体验 |
| P2 | 移动端响应式 | Capacitor 准备 |
| P2 | 主题资源加载 | 视觉完整性 |

### 5. 测试环境要求

- Node.js 18+
- 后端运行在 localhost:3000
- 前端运行在 localhost:5173
- Firebase 配置正确
- Puppeteer 依赖安装完成
