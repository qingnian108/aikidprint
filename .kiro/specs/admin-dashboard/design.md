# Admin Dashboard Design Document

## Overview

AI Kid Print 后台管理系统是一个独立的管理界面，用于管理平台的用户、订阅、内容和系统配置。系统采用前后端分离架构，前端使用 React + TypeScript，后端复用现有的 Express 服务器，数据存储在 Firebase Firestore。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   React Frontend                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │
│  │  │Dashboard│ │  Users  │ │Subscript│ │ Content │    │    │
│  │  │Overview │ │ Manage  │ │  ions   │ │  Stats  │    │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                │    │
│  │  │ Weekly  │ │ System  │ │  Data   │                │    │
│  │  │Delivery │ │ Config  │ │ Export  │                │    │
│  │  └─────────┘ └─────────┘ └─────────┘                │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Express Backend (existing)              │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              /api/admin/*                    │    │    │
│  │  │  - /stats      - /users      - /subscriptions│    │    │
│  │  │  - /payments   - /usage      - /delivery     │    │    │
│  │  │  - /config     - /export     - /logs         │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Firebase Firestore                   │    │
│  │  ┌───────┐ ┌────────────┐ ┌──────────┐ ┌───────┐   │    │
│  │  │ users │ │subscriptions│ │ payments │ │ usage │   │    │
│  │  └───────┘ └────────────┘ └──────────┘ └───────┘   │    │
│  │  ┌─────────┐ ┌────────────────────┐ ┌───────────┐  │    │
│  │  │downloads│ │weeklyDeliverySettings│ │ children │  │    │
│  │  └─────────┘ └────────────────────┘ └───────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

```
src/admin/
├── pages/
│   ├── AdminLogin.tsx          # 管理员登录页
│   ├── AdminDashboard.tsx      # 仪表盘概览
│   ├── UserManagement.tsx      # 用户管理
│   ├── SubscriptionManagement.tsx  # 订阅管理
│   ├── PaymentHistory.tsx      # 支付历史
│   ├── ContentStats.tsx        # 内容统计
│   ├── WeeklyDeliveryAdmin.tsx # Weekly Delivery 管理
│   ├── SystemConfig.tsx        # 系统配置
│   └── DataExport.tsx          # 数据导出
├── components/
│   ├── AdminLayout.tsx         # 管理后台布局
│   ├── AdminSidebar.tsx        # 侧边导航栏
│   ├── StatsCard.tsx           # 统计卡片组件
│   ├── DataTable.tsx           # 数据表格组件
│   ├── SearchBar.tsx           # 搜索栏组件
│   ├── DateRangePicker.tsx     # 日期范围选择器
│   └── Charts/
│       ├── LineChart.tsx       # 折线图
│       ├── BarChart.tsx        # 柱状图
│       └── PieChart.tsx        # 饼图
├── services/
│   └── adminApi.ts             # 管理后台 API 服务
├── contexts/
│   └── AdminAuthContext.tsx    # 管理员认证上下文
└── hooks/
    ├── useAdminAuth.ts         # 管理员认证 Hook
    └── usePagination.ts        # 分页 Hook
```

### Backend API Endpoints

```typescript
// Admin Routes - /api/admin/*

// Authentication
POST   /api/admin/login          // 管理员登录
POST   /api/admin/logout         // 管理员登出
GET    /api/admin/verify         // 验证管理员身份

// Dashboard Stats
GET    /api/admin/stats/overview // 获取概览统计
GET    /api/admin/stats/users    // 用户增长统计
GET    /api/admin/stats/usage    // 使用量统计
GET    /api/admin/stats/revenue  // 收入统计

// User Management
GET    /api/admin/users          // 获取用户列表（分页）
GET    /api/admin/users/:id      // 获取用户详情
PUT    /api/admin/users/:id/plan // 更新用户计划
GET    /api/admin/users/:id/usage // 获取用户使用历史

// Subscription Management
GET    /api/admin/subscriptions  // 获取订阅列表
PUT    /api/admin/subscriptions/:id/extend  // 延期订阅
PUT    /api/admin/subscriptions/:id/cancel  // 取消订阅

// Payment Management
GET    /api/admin/payments       // 获取支付记录

// Content Statistics
GET    /api/admin/content/stats  // 获取内容统计
GET    /api/admin/content/themes // 获取主题统计

// Weekly Delivery
GET    /api/admin/delivery/settings  // 获取推送设置列表
POST   /api/admin/delivery/trigger   // 手动触发推送
GET    /api/admin/delivery/history   // 获取推送历史

// System Configuration
GET    /api/admin/config         // 获取系统配置
PUT    /api/admin/config         // 更新系统配置
GET    /api/admin/logs           // 获取系统日志

// Data Export
GET    /api/admin/export/users   // 导出用户数据
GET    /api/admin/export/subscriptions  // 导出订阅数据
GET    /api/admin/export/payments // 导出支付数据
GET    /api/admin/export/usage   // 导出使用数据
```

## Data Models

### Admin User (存储在环境变量或配置文件)

```typescript
interface AdminCredentials {
  email: string;
  passwordHash: string;  // bcrypt hashed
  role: 'super_admin' | 'admin';
}
```

### System Configuration (Firestore: systemConfig)

```typescript
interface SystemConfig {
  freeDailyLimit: number;      // Free 用户每日限制，默认 3
  proMonthlyPrice: number;     // Pro 月费，默认 4.99
  cronEnabled: boolean;        // 定时任务开关
  cronExpression: string;      // Cron 表达式
  timezone: string;            // 时区
  updatedAt: Timestamp;
  updatedBy: string;           // 更新者 admin email
}
```

### Admin Action Log (Firestore: adminLogs)

```typescript
interface AdminLog {
  logId: string;
  adminEmail: string;
  action: string;              // 'user_upgrade' | 'subscription_cancel' | 'config_update' | etc.
  targetType: string;          // 'user' | 'subscription' | 'config' | etc.
  targetId: string;
  details: Record<string, any>;
  createdAt: Timestamp;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin Authentication Enforcement
*For any* request to admin API endpoints (except /login), if the request does not contain a valid admin token, the system should return 401 Unauthorized.
**Validates: Requirements 1.2, 1.3**

### Property 2: User Count Consistency
*For any* dashboard overview request, the total users count should equal the number of documents in the users collection.
**Validates: Requirements 2.1**

### Property 3: Active Subscription Count Consistency
*For any* dashboard overview request, the active Pro subscribers count should equal the number of subscriptions with status='active' and endDate > now.
**Validates: Requirements 2.2**

### Property 4: User Search Filter Correctness
*For any* user search query, all returned users should have an email containing the search term (case-insensitive).
**Validates: Requirements 3.2**

### Property 5: User Plan Upgrade Consistency
*For any* user upgrade to Pro, after the operation completes, the user's plan should be 'Pro' and there should exist an active subscription for that user.
**Validates: Requirements 3.4**

### Property 6: User Plan Downgrade Consistency
*For any* user downgrade to Free, after the operation completes, the user's plan should be 'Free' and any active subscription should be marked as 'cancelled'.
**Validates: Requirements 3.5**

### Property 7: Subscription List Filter Correctness
*For any* subscription list request, all returned subscriptions should have status='active'.
**Validates: Requirements 4.1**

### Property 8: Subscription Extension Validity
*For any* subscription extension operation, the new end date should be strictly greater than the previous end date.
**Validates: Requirements 4.3**

### Property 9: Subscription Cancellation Consistency
*For any* subscription cancellation, after the operation completes, the subscription status should be 'cancelled' and the associated user's plan should be 'Free'.
**Validates: Requirements 4.4**

### Property 10: Payment Status Filter Correctness
*For any* payment filter by status, all returned payments should have the specified status.
**Validates: Requirements 4.6**

### Property 11: Theme Ranking Order
*For any* theme popularity ranking, themes should be sorted in descending order by generation count.
**Validates: Requirements 5.2**

### Property 12: Date Range Filter Correctness
*For any* date range filter on statistics, all returned data points should have timestamps within the specified range (inclusive).
**Validates: Requirements 5.3**

### Property 13: Weekly Delivery List Filter
*For any* weekly delivery settings list, all returned settings should have enabled=true.
**Validates: Requirements 6.1**

### Property 14: Configuration Update Persistence
*For any* configuration update, after the operation completes, reading the configuration should return the updated values.
**Validates: Requirements 7.2, 7.3**

### Property 15: CSV Export Completeness
*For any* data export request, the generated CSV should contain all records from the corresponding collection (within any specified filters).
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

## Error Handling

### Authentication Errors
- Invalid credentials: Return 401 with message "Invalid email or password"
- Expired token: Return 401 with message "Session expired, please login again"
- Insufficient permissions: Return 403 with message "Access denied"

### Data Errors
- User not found: Return 404 with message "User not found"
- Subscription not found: Return 404 with message "Subscription not found"
- Invalid operation: Return 400 with specific error message

### System Errors
- Database connection error: Return 500 with message "Database error, please try again"
- Export generation error: Return 500 with message "Export failed, please try again"

## Testing Strategy

### Unit Testing
- Test individual API endpoint handlers
- Test data transformation functions
- Test authentication middleware

### Property-Based Testing
Using a property-based testing library (e.g., fast-check for TypeScript):

- **Property 1**: Generate random requests without tokens, verify 401 response
- **Property 4**: Generate random search terms, verify all results contain the term
- **Property 5**: Generate random user upgrades, verify plan and subscription consistency
- **Property 6**: Generate random user downgrades, verify plan and subscription consistency
- **Property 8**: Generate random extension operations, verify end date increases
- **Property 10**: Generate random status filters, verify all results match
- **Property 11**: Generate random theme data, verify ranking is sorted correctly
- **Property 15**: Generate random data sets, verify CSV contains all records

### Integration Testing
- Test complete user management flow (list → view → upgrade → downgrade)
- Test subscription lifecycle (create → extend → cancel)
- Test data export with various filters
