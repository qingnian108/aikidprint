# Design Document: AI Kid Print Android App

## Overview

本设计文档定义了 AI Kid Print Android 原生应用的技术架构和实现方案。应用使用 React Native 开发，复用现有后端 API，采用与网站一致的 Brutal/Neo-brutalism UI 设计风格。

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│  Screens (UI Layer)                                          │
│  ├── HomeScreen                                              │
│  ├── WeeklyPackScreen                                        │
│  ├── CustomPackScreen                                        │
│  ├── PreviewScreen                                           │
│  ├── DashboardScreen                                         │
│  ├── LoginScreen                                             │
│  └── SettingsScreen                                          │
├─────────────────────────────────────────────────────────────┤
│  Components (Reusable UI)                                    │
│  ├── BrutalButton, BrutalCard, BrutalInput                  │
│  ├── ThemeSelector, AgeSelector                              │
│  ├── PageGrid, PagePreview                                   │
│  └── LoadingOverlay, ErrorModal                              │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                  │
│  ├── authStore (user, token, plan)                          │
│  ├── packStore (pages, selections)                          │
│  └── settingsStore (paperSize, theme)                       │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                   │
│  ├── apiService (HTTP requests)                              │
│  ├── authService (Firebase Auth)                             │
│  ├── storageService (AsyncStorage)                           │
│  └── pdfService (PDF generation)                             │
├─────────────────────────────────────────────────────────────┤
│  Native Modules                                              │
│  ├── Firebase (Auth, Firestore, FCM)                        │
│  ├── Google Play Billing                                     │
│  └── File System                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Existing)                    │
│  http://your-server.com/api                                  │
│  ├── /weekly-pack/generate-pages                             │
│  ├── /weekly-pack/save                                       │
│  ├── /custom-pack/generate                                   │
│  └── /health                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | React Native 0.73+ | 跨平台移动开发 |
| 语言 | TypeScript | 类型安全 |
| 导航 | React Navigation 6 | 原生导航体验 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 网络请求 | Axios | HTTP 客户端 |
| 认证 | @react-native-firebase/auth | Firebase 认证 |
| 存储 | @react-native-async-storage | 本地存储 |
| PDF | react-native-pdf-lib | PDF 生成 |
| 支付 | react-native-iap | Google Play 内购 |
| 推送 | @react-native-firebase/messaging | FCM 推送 |

## Components and Interfaces

### 1. 项目结构

```
ai-kid-print-app/
├── android/                    # Android 原生代码
├── src/
│   ├── components/            # 可复用组件
│   │   ├── brutal/           # Brutal 风格组件
│   │   │   ├── BrutalButton.tsx
│   │   │   ├── BrutalCard.tsx
│   │   │   ├── BrutalInput.tsx
│   │   │   └── index.ts
│   │   ├── pack/             # Pack 相关组件
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── AgeSelector.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   └── PageGrid.tsx
│   │   └── common/           # 通用组件
│   │       ├── LoadingOverlay.tsx
│   │       ├── ErrorModal.tsx
│   │       └── TabBar.tsx
│   ├── screens/              # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── WeeklyPackScreen.tsx
│   │   ├── CustomPackScreen.tsx
│   │   ├── PreviewScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── PricingScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/           # 导航配置
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/             # 业务服务
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   └── pdf.ts
│   ├── stores/               # 状态管理
│   │   ├── authStore.ts
│   │   ├── packStore.ts
│   │   └── settingsStore.ts
│   ├── theme/                # 主题配置
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── types/                # TypeScript 类型
│   │   └── index.ts
│   ├── utils/                # 工具函数
│   │   └── helpers.ts
│   └── App.tsx               # 应用入口
├── package.json
└── tsconfig.json
```

### 2. 核心组件接口

```typescript
// types/index.ts

// 用户类型
interface User {
  uid: string;
  email: string;
  displayName?: string;
  plan: 'Free' | 'Pro';
}

// 主题类型
interface Theme {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 年龄组类型
interface AgeGroup {
  value: string;
  label: string;
  icon: string;
}

// 生成的页面类型
interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

// Pack 数据类型
interface PackData {
  packId: string;
  childName: string;
  age: string;
  theme: string;
  weekNumber?: number;
  pages: GeneratedPage[];
  createdAt: string;
}

// API 响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 3. 导航结构

```typescript
// navigation/AppNavigator.tsx

// 根导航
RootStack
├── AuthStack (未登录)
│   ├── LoginScreen
│   └── SignUpScreen
└── MainStack (已登录)
    ├── TabNavigator
    │   ├── HomeTab → HomeScreen
    │   ├── WeeklyPackTab → WeeklyPackScreen
    │   ├── CustomPackTab → CustomPackScreen
    │   └── ProfileTab → DashboardScreen
    ├── PreviewScreen (Modal)
    ├── PricingScreen (Modal)
    └── SettingsScreen
```

## Data Models

### 1. 状态管理 Store

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// stores/packStore.ts
interface PackState {
  // Weekly Pack
  childName: string;
  age: string;
  theme: string;
  generatedPages: GeneratedPage[];
  isGenerating: boolean;
  
  // Custom Pack
  selections: Record<string, number>;
  
  // Actions
  setChildName: (name: string) => void;
  setAge: (age: string) => void;
  setTheme: (theme: string) => void;
  generateWeeklyPack: () => Promise<void>;
  generateCustomPack: () => Promise<void>;
  reset: () => void;
}

// stores/settingsStore.ts
interface SettingsState {
  paperSize: 'letter' | 'a4';
  setPaperSize: (size: 'letter' | 'a4') => void;
  detectPaperSize: () => void;
}
```

### 2. API 服务

```typescript
// services/api.ts
const API_BASE_URL = 'https://your-server.com';

export const api = {
  // Weekly Pack
  generateWeeklyPack: (data: {
    childName: string;
    age: string;
    theme: string;
  }) => axios.post(`${API_BASE_URL}/api/weekly-pack/generate-pages`, data),
  
  saveWeeklyPack: (data: PackData) => 
    axios.post(`${API_BASE_URL}/api/weekly-pack/save`, data),
  
  getWeeklyPack: (packId: string) => 
    axios.get(`${API_BASE_URL}/api/weekly-pack/pack/${packId}`),
  
  // Custom Pack
  generateCustomPack: (data: {
    theme: string;
    selections: Record<string, number>;
  }) => axios.post(`${API_BASE_URL}/api/custom-pack/generate`, data),
  
  getCustomPack: (packId: string) => 
    axios.get(`${API_BASE_URL}/api/custom-pack/${packId}`),
  
  // Health
  healthCheck: () => axios.get(`${API_BASE_URL}/health`),
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 认证状态导航一致性
*For any* app launch, if the user is not authenticated, the system SHALL display the login screen; if authenticated, the system SHALL display the main tab navigator.
**Validates: Requirements 3.1, 3.4**

### Property 2: 认证失败错误显示
*For any* failed authentication attempt (invalid credentials, network error, etc.), the system SHALL display an appropriate error message to the user.
**Validates: Requirements 3.6**

### Property 3: Tab 导航正确性
*For any* tab press in the bottom navigation, the system SHALL navigate to the corresponding screen without errors.
**Validates: Requirements 4.2**

### Property 4: 登录用户历史显示
*For any* authenticated user on the Home screen, if they have download history, the system SHALL display their recent downloads.
**Validates: Requirements 4.4**

### Property 5: 年龄选择状态
*For any* age group selection, the selected option SHALL be visually highlighted and the state SHALL be updated correctly.
**Validates: Requirements 5.2**

### Property 6: 主题选择状态
*For any* theme selection, the selected theme SHALL display its icon and be visually highlighted.
**Validates: Requirements 5.3**

### Property 7: 生成成功导航
*For any* successful pack generation (Weekly or Custom), the system SHALL navigate to the preview screen with all generated pages.
**Validates: Requirements 5.6, 6.5**

### Property 8: 生成失败错误处理
*For any* failed pack generation, the system SHALL display an error message with a retry option.
**Validates: Requirements 5.7**

### Property 9: 分类展开显示
*For any* category expansion in Custom Pack, the system SHALL display all page types within that category.
**Validates: Requirements 6.2**

### Property 10: 页面数量计算
*For any* quantity adjustment in Custom Pack, the total page count SHALL equal the sum of all selected quantities.
**Validates: Requirements 6.3**

### Property 11: 预览页面完整性
*For any* pack preview, the number of displayed page thumbnails SHALL equal the number of generated pages.
**Validates: Requirements 7.1**

### Property 12: 页面详情显示
*For any* page in the preview, the system SHALL display the page number, type, and title correctly.
**Validates: Requirements 7.3**

### Property 13: Pro 用户下载权限
*For any* Pro user tapping download, the system SHALL initiate PDF generation; for any Free user, the system SHALL navigate to the upgrade screen.
**Validates: Requirements 8.1, 8.4**

### Property 14: 下载失败错误处理
*For any* failed download, the system SHALL display an error message with a retry option.
**Validates: Requirements 8.5**

### Property 15: Dashboard 统计显示
*For any* user on the Dashboard, the system SHALL display accurate total downloads and this week's downloads.
**Validates: Requirements 9.2**

### Property 16: 下载历史列表
*For any* user with download history, the Dashboard SHALL list all recent downloads.
**Validates: Requirements 9.3**

### Property 17: 离线缓存可用性
*For any* downloaded pack, when the app is offline, the cached images SHALL be accessible.
**Validates: Requirements 11.1, 11.2**

### Property 18: 纸张大小持久化
*For any* paper size selection, the preference SHALL be saved and used in subsequent PDF generations.
**Validates: Requirements 13.2, 13.3**

### Property 19: 纸张大小自动检测
*For any* first app launch, the system SHALL detect paper size based on device locale (Americas → Letter, others → A4).
**Validates: Requirements 13.4**

## Error Handling

### 错误类型和处理策略

| 错误类型 | 处理方式 | 用户反馈 |
|----------|----------|----------|
| 网络错误 | 重试机制 + 离线模式 | "网络连接失败，请检查网络" |
| API 错误 | 显示错误详情 | "生成失败：[错误信息]" |
| 认证错误 | 重定向登录 | "请重新登录" |
| 支付错误 | 显示支付状态 | "支付失败，请重试" |
| 存储错误 | 清理缓存 | "存储空间不足" |
| PDF 生成错误 | 重试选项 | "PDF 生成失败，请重试" |

### 错误边界组件

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
```

## Testing Strategy

### 1. 单元测试 (Jest)

- 测试 Store 状态逻辑
- 测试工具函数
- 测试 API 服务（mock）

### 2. 组件测试 (React Native Testing Library)

- 测试组件渲染
- 测试用户交互
- 测试条件渲染

### 3. 属性测试 (fast-check)

- 测试状态计算逻辑
- 测试数据转换函数
- 测试导航逻辑

### 4. E2E 测试 (Detox)

- 测试完整用户流程
- 测试导航流程
- 测试认证流程

### 测试文件结构

```
__tests__/
├── unit/
│   ├── stores/
│   │   ├── authStore.test.ts
│   │   ├── packStore.test.ts
│   │   └── settingsStore.test.ts
│   └── utils/
│       └── helpers.test.ts
├── components/
│   ├── BrutalButton.test.tsx
│   ├── ThemeSelector.test.tsx
│   └── PageGrid.test.tsx
├── screens/
│   ├── HomeScreen.test.tsx
│   ├── WeeklyPackScreen.test.tsx
│   └── LoginScreen.test.tsx
└── e2e/
    ├── auth.e2e.ts
    ├── weeklyPack.e2e.ts
    └── customPack.e2e.ts
```

### 测试框架配置

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e:build": "detox build -c android.emu.debug",
    "e2e:test": "detox test -c android.emu.debug"
  }
}
```
