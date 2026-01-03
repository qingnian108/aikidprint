# Requirements Document

## Introduction

本文档定义了 AI Kid Print 后台管理系统的需求。该系统为管理员提供一个集中化的界面，用于管理用户、订阅、内容和系统配置。后台管理系统将帮助运营团队监控业务指标、管理用户账户、处理订阅问题，并维护平台内容。

## Glossary

- **Admin Dashboard**: 管理员后台控制面板，用于管理整个平台
- **User**: 使用 AI Kid Print 的注册用户（家长）
- **Subscription**: 用户的付费订阅记录（Pro 计划）
- **Payment**: 用户的支付记录
- **Usage**: 用户的每日使用配额记录
- **Download**: 用户的下载历史记录
- **Weekly Pack**: 每周自动生成的作业包
- **Child Profile**: 用户添加的孩子档案
- **Weekly Delivery Settings**: 用户的每周推送设置

## Requirements

### Requirement 1: 管理员认证与权限

**User Story:** As an administrator, I want to securely access the admin dashboard, so that I can manage the platform without unauthorized access.

#### Acceptance Criteria

1. WHEN an administrator visits the admin dashboard URL THEN the System SHALL display a login form requiring email and password
2. WHEN an administrator enters valid admin credentials THEN the System SHALL grant access to the dashboard
3. WHEN a non-admin user attempts to access the admin dashboard THEN the System SHALL deny access and redirect to the main site
4. WHILE an administrator is logged in THEN the System SHALL maintain the session for 24 hours before requiring re-authentication
5. WHEN an administrator clicks logout THEN the System SHALL terminate the session and redirect to the login page

---

### Requirement 2: 仪表盘概览

**User Story:** As an administrator, I want to see key business metrics at a glance, so that I can quickly understand the platform's health.

#### Acceptance Criteria

1. WHEN an administrator views the dashboard home THEN the System SHALL display total registered users count
2. WHEN an administrator views the dashboard home THEN the System SHALL display active Pro subscribers count
3. WHEN an administrator views the dashboard home THEN the System SHALL display total worksheets generated today
4. WHEN an administrator views the dashboard home THEN the System SHALL display total revenue this month
5. WHEN an administrator views the dashboard home THEN the System SHALL display a chart showing user growth over the past 30 days
6. WHEN an administrator views the dashboard home THEN the System SHALL display a chart showing daily worksheet generation over the past 7 days

---

### Requirement 3: 用户管理

**User Story:** As an administrator, I want to view and manage user accounts, so that I can assist users and handle account issues.

#### Acceptance Criteria

1. WHEN an administrator navigates to user management THEN the System SHALL display a paginated list of all users with email, plan, and registration date
2. WHEN an administrator searches for a user by email THEN the System SHALL filter the list to show matching users
3. WHEN an administrator clicks on a user THEN the System SHALL display the user's detailed profile including subscription status, usage history, and children profiles
4. WHEN an administrator upgrades a user to Pro THEN the System SHALL update the user's plan and create a subscription record
5. WHEN an administrator downgrades a user to Free THEN the System SHALL update the user's plan and mark the subscription as cancelled
6. WHEN an administrator views a user's usage THEN the System SHALL display the user's daily generation counts for the past 30 days

---

### Requirement 4: 订阅与支付管理

**User Story:** As an administrator, I want to manage subscriptions and view payment history, so that I can handle billing issues and track revenue.

#### Acceptance Criteria

1. WHEN an administrator navigates to subscription management THEN the System SHALL display a list of all active subscriptions with user email, start date, and end date
2. WHEN an administrator searches for a subscription by user email THEN the System SHALL filter the list to show matching subscriptions
3. WHEN an administrator extends a subscription THEN the System SHALL update the end date and log the action
4. WHEN an administrator cancels a subscription THEN the System SHALL mark the subscription as cancelled and update the user's plan to Free
5. WHEN an administrator views payment history THEN the System SHALL display all payments with amount, date, status, and PayPal order ID
6. WHEN an administrator filters payments by status THEN the System SHALL show only payments matching the selected status (pending, completed, failed)

---

### Requirement 5: 内容与生成统计

**User Story:** As an administrator, I want to view worksheet generation statistics, so that I can understand which content is most popular.

#### Acceptance Criteria

1. WHEN an administrator navigates to content statistics THEN the System SHALL display total generations per worksheet type
2. WHEN an administrator views content statistics THEN the System SHALL display a ranking of most popular themes
3. WHEN an administrator selects a date range THEN the System SHALL filter statistics to show data within that range
4. WHEN an administrator views generation trends THEN the System SHALL display a chart showing daily generation counts by category

---

### Requirement 6: Weekly Delivery 管理

**User Story:** As an administrator, I want to manage weekly delivery settings and monitor delivery status, so that I can ensure users receive their weekly packs.

#### Acceptance Criteria

1. WHEN an administrator navigates to weekly delivery management THEN the System SHALL display a list of all users with weekly delivery enabled
2. WHEN an administrator views a user's delivery settings THEN the System SHALL display the child name, age, theme, delivery method, and schedule
3. WHEN an administrator triggers a manual delivery for a user THEN the System SHALL generate and send the weekly pack immediately
4. WHEN an administrator views delivery history THEN the System SHALL display past deliveries with date, status, and page count
5. IF a delivery fails THEN the System SHALL display the error reason and allow retry

---

### Requirement 7: 系统配置

**User Story:** As an administrator, I want to configure system settings, so that I can adjust platform behavior without code changes.

#### Acceptance Criteria

1. WHEN an administrator navigates to system settings THEN the System SHALL display current configuration values
2. WHEN an administrator updates the free user daily limit THEN the System SHALL save the new value and apply it immediately
3. WHEN an administrator updates the Pro subscription price THEN the System SHALL save the new value for future subscriptions
4. WHEN an administrator enables or disables the cron job THEN the System SHALL update the cron service status
5. WHEN an administrator views system logs THEN the System SHALL display recent error logs and important events

---

### Requirement 8: 数据导出

**User Story:** As an administrator, I want to export data for analysis, so that I can create reports and perform offline analysis.

#### Acceptance Criteria

1. WHEN an administrator requests user data export THEN the System SHALL generate a CSV file with user information
2. WHEN an administrator requests subscription data export THEN the System SHALL generate a CSV file with subscription details
3. WHEN an administrator requests payment data export THEN the System SHALL generate a CSV file with payment records
4. WHEN an administrator requests usage data export THEN the System SHALL generate a CSV file with daily usage statistics
