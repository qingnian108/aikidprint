# Requirements Document

## Introduction

本文档定义了 AI Kid Print Android 原生应用的开发需求。该应用将复用现有网站的后端 API，采用相同的 UI 设计风格（Brutal/Neo-brutalism），使用 React Native 开发以实现跨平台能力并复用 React 开发经验。

## Glossary

- **React Native**: Facebook 开发的跨平台移动应用框架，使用 React 语法开发原生应用
- **Brutal Design**: 新野蛮主义设计风格，特点是粗边框、阴影、鲜艳色彩、圆角卡片
- **Weekly Pack**: 每周自动生成的练习册，包含 10-20 页个性化内容
- **Custom Pack**: 用户自定义选择页面类型的练习册
- **Theme**: 主题风格（恐龙、太空、独角兽、海洋、车辆、野生动物）
- **PDF Generator**: 将练习页面导出为 PDF 的功能
- **Firebase Auth**: Google Firebase 提供的用户认证服务
- **API_BASE_URL**: 后端服务地址，用于调用练习册生成 API

## Requirements

### Requirement 1: 应用架构和项目初始化

**User Story:** As a developer, I want to set up a React Native project with proper architecture, so that I can build a maintainable and scalable Android app.

#### Acceptance Criteria

1. WHEN the project is initialized THEN the system SHALL use React Native CLI with TypeScript template
2. WHEN the project structure is created THEN the system SHALL follow feature-based folder organization
3. WHEN dependencies are installed THEN the system SHALL include navigation, state management, and UI libraries
4. WHEN the app is built THEN the system SHALL generate a valid Android APK

### Requirement 2: UI 设计系统实现

**User Story:** As a user, I want the app to have the same visual style as the website, so that I have a consistent brand experience.

#### Acceptance Criteria

1. WHEN the app renders UI components THEN the system SHALL use Brutal/Neo-brutalism design style with thick borders (2-4px)
2. WHEN displaying colors THEN the system SHALL use the brand color palette (duck-yellow #FFE066, duck-blue #7BD3EA, duck-green #A1E44D, duck-orange #FF9F1C, duck-pink #FF99C8)
3. WHEN rendering buttons THEN the system SHALL display shadow-brutal effect (offset shadow)
4. WHEN displaying cards THEN the system SHALL use rounded corners (16-24px) with black borders
5. WHEN loading fonts THEN the system SHALL use Quicksand font family for display text

### Requirement 3: 用户认证功能

**User Story:** As a user, I want to log in with my existing account, so that I can access my saved worksheets and subscription.

#### Acceptance Criteria

1. WHEN a user opens the app without authentication THEN the system SHALL display the login screen
2. WHEN a user taps Google Sign-In THEN the system SHALL initiate Firebase Google authentication
3. WHEN a user enters email and password THEN the system SHALL authenticate via Firebase Email/Password
4. WHEN authentication succeeds THEN the system SHALL navigate to the Dashboard screen
5. WHEN a user taps logout THEN the system SHALL clear the session and return to login screen
6. IF authentication fails THEN the system SHALL display an appropriate error message

### Requirement 4: 首页和导航

**User Story:** As a user, I want to navigate easily between app features, so that I can quickly access the functionality I need.

#### Acceptance Criteria

1. WHEN the app launches THEN the system SHALL display a bottom tab navigation with Home, Weekly Pack, Custom Pack, and Profile tabs
2. WHEN a user taps a tab THEN the system SHALL navigate to the corresponding screen
3. WHEN displaying the Home screen THEN the system SHALL show quick action cards for Weekly Pack and Custom Pack
4. WHEN displaying the Home screen THEN the system SHALL show user's recent downloads if logged in

### Requirement 5: Weekly Pack 生成功能

**User Story:** As a user, I want to generate weekly learning packs for my child, so that they have personalized educational content.

#### Acceptance Criteria

1. WHEN a user opens Weekly Pack screen THEN the system SHALL display input form for child name, age, and theme
2. WHEN a user selects an age group THEN the system SHALL highlight the selected option with visual feedback
3. WHEN a user selects a theme THEN the system SHALL display the theme icon and highlight the selection
4. WHEN a user taps Generate THEN the system SHALL call the backend API /api/weekly-pack/generate-pages
5. WHEN generation is in progress THEN the system SHALL display a loading animation with progress indicator
6. WHEN generation completes THEN the system SHALL navigate to the preview screen showing all generated pages
7. IF generation fails THEN the system SHALL display an error message with retry option

### Requirement 6: Custom Pack 生成功能

**User Story:** As a user, I want to create custom packs with specific worksheet types, so that I can tailor content to my child's needs.

#### Acceptance Criteria

1. WHEN a user opens Custom Pack screen THEN the system SHALL display theme selector and category list
2. WHEN a user expands a category THEN the system SHALL show all page types with quantity selectors
3. WHEN a user adjusts quantity THEN the system SHALL update the total page count in real-time
4. WHEN a user taps Generate THEN the system SHALL call the backend API /api/custom-pack/generate
5. WHEN generation completes THEN the system SHALL navigate to the preview screen

### Requirement 7: 练习册预览功能

**User Story:** As a user, I want to preview generated worksheets before downloading, so that I can verify the content.

#### Acceptance Criteria

1. WHEN the preview screen loads THEN the system SHALL display all generated pages in a scrollable grid
2. WHEN a user taps a page thumbnail THEN the system SHALL display the full-size image in a modal
3. WHEN displaying page details THEN the system SHALL show page number, type, and title
4. WHEN a user swipes in full-screen mode THEN the system SHALL navigate between pages

### Requirement 8: PDF 下载功能

**User Story:** As a user, I want to download my worksheets as PDF, so that I can print them.

#### Acceptance Criteria

1. WHEN a Pro user taps Download THEN the system SHALL generate a PDF from the page images
2. WHEN PDF generation completes THEN the system SHALL save the file to device storage
3. WHEN download completes THEN the system SHALL display a success notification with open option
4. WHEN a Free user taps Download THEN the system SHALL navigate to the upgrade screen
5. IF download fails THEN the system SHALL display an error message with retry option

### Requirement 9: 用户 Dashboard

**User Story:** As a user, I want to view my account information and download history, so that I can manage my usage.

#### Acceptance Criteria

1. WHEN a user opens Dashboard THEN the system SHALL display subscription status (Free/Pro)
2. WHEN displaying stats THEN the system SHALL show total downloads and this week's downloads
3. WHEN displaying history THEN the system SHALL list recent downloads with regenerate option
4. WHEN a user taps a history item THEN the system SHALL navigate to the pack preview

### Requirement 10: 订阅和支付

**User Story:** As a user, I want to upgrade to Pro subscription, so that I can access unlimited downloads.

#### Acceptance Criteria

1. WHEN a Free user views pricing THEN the system SHALL display Pro plan benefits and price
2. WHEN a user taps Subscribe THEN the system SHALL initiate Google Play in-app purchase
3. WHEN purchase completes THEN the system SHALL update user plan to Pro in Firebase
4. WHEN subscription expires THEN the system SHALL downgrade user to Free plan

### Requirement 11: 离线支持和缓存

**User Story:** As a user, I want to access my downloaded packs offline, so that I can use the app without internet.

#### Acceptance Criteria

1. WHEN a pack is downloaded THEN the system SHALL cache the images locally
2. WHEN the app is offline THEN the system SHALL display cached packs in history
3. WHEN the app reconnects THEN the system SHALL sync any pending data with the server

### Requirement 12: 推送通知

**User Story:** As a user, I want to receive notifications about new weekly packs, so that I don't miss new content.

#### Acceptance Criteria

1. WHEN a user enables notifications THEN the system SHALL register for Firebase Cloud Messaging
2. WHEN a new weekly pack is available THEN the system SHALL display a push notification
3. WHEN a user taps the notification THEN the system SHALL open the Weekly Pack screen

### Requirement 13: 打印设置

**User Story:** As a user, I want to configure print settings, so that PDFs are optimized for my printer.

#### Acceptance Criteria

1. WHEN a user opens print settings THEN the system SHALL display paper size options (Letter/A4)
2. WHEN a user selects paper size THEN the system SHALL save the preference locally and to Firebase
3. WHEN generating PDF THEN the system SHALL use the saved paper size setting
4. WHEN the app first launches THEN the system SHALL auto-detect paper size based on device locale
