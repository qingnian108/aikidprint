# Requirements Document

## Introduction

本文档定义了 AI Kid Print 网站在转换为移动端应用之前的全面测试需求。目标是确保现有功能正常运行，识别潜在问题，并为移动端迁移做好准备。

## Glossary

- **Frontend**: 基于 React + Vite + TypeScript 的前端应用
- **Backend**: 基于 Express + Puppeteer 的后端 API 服务
- **Weekly Pack**: 每周自动生成的练习册功能
- **Custom Pack**: 用户自定义练习册功能
- **Generator**: 单页练习题生成器
- **PDF Generator**: 将练习页面导出为 PDF 的功能
- **Image Generator**: 后端使用 Puppeteer 生成练习页面图片的服务
- **Capacitor**: 将 Web 应用打包为原生移动应用的框架

## Requirements

### Requirement 1: 前端应用启动测试

**User Story:** As a developer, I want to verify the frontend application starts correctly, so that I can ensure the basic infrastructure is working.

#### Acceptance Criteria

1. WHEN the frontend development server starts THEN the system SHALL display the home page without errors
2. WHEN the user navigates to any route THEN the system SHALL render the corresponding page component
3. IF the frontend encounters a JavaScript error THEN the system SHALL display the ErrorBoundary fallback UI

### Requirement 2: 后端 API 服务测试

**User Story:** As a developer, I want to verify all backend API endpoints are functional, so that I can ensure data flow works correctly.

#### Acceptance Criteria

1. WHEN a GET request is sent to /health THEN the system SHALL return status 200 with JSON containing status "ok"
2. WHEN a GET request is sent to /api/hello THEN the system SHALL return a welcome message
3. WHEN the backend server starts THEN the system SHALL initialize cron jobs for weekly delivery
4. IF an API request fails THEN the system SHALL return appropriate error status and message

### Requirement 3: Weekly Pack 功能测试

**User Story:** As a user, I want to generate weekly practice packs, so that my child can have consistent learning materials.

#### Acceptance Criteria

1. WHEN a user selects age group and theme THEN the system SHALL display available weekly pack options
2. WHEN a user requests weekly pack generation THEN the system SHALL call the backend API to generate pages
3. WHEN weekly pack pages are generated THEN the system SHALL display preview images for all pages
4. WHEN a user downloads the weekly pack THEN the system SHALL generate a PDF with correct paper size (Letter or A4)

### Requirement 4: Custom Pack 功能测试

**User Story:** As a user, I want to create custom practice packs, so that I can tailor learning materials to my child's needs.

#### Acceptance Criteria

1. WHEN a user selects page types for custom pack THEN the system SHALL allow selection of multiple page types
2. WHEN a user configures custom pack settings THEN the system SHALL save theme, age group, and page selections
3. WHEN custom pack is generated THEN the system SHALL create all selected page types
4. WHEN a user previews custom pack THEN the system SHALL display all generated pages in order

### Requirement 5: 图片生成服务测试

**User Story:** As a developer, I want to verify the image generation service works correctly, so that all worksheet pages render properly.

#### Acceptance Criteria

1. WHEN the image generator receives a page request THEN the system SHALL use Puppeteer to render the page
2. WHEN rendering a page THEN the system SHALL use Letter dimensions (816x1056 pixels)
3. WHEN a page contains theme assets THEN the system SHALL load images from the correct path
4. IF image generation fails THEN the system SHALL return an error with details

### Requirement 6: PDF 生成功能测试

**User Story:** As a user, I want to download my worksheets as PDF, so that I can print them easily.

#### Acceptance Criteria

1. WHEN a user selects Letter paper size THEN the system SHALL generate PDF with images filling the width
2. WHEN a user selects A4 paper size THEN the system SHALL generate PDF with images filling the height and cropping sides evenly
3. WHEN generating multi-page PDF THEN the system SHALL include all pages in correct order
4. WHEN PDF generation completes THEN the system SHALL trigger browser download

### Requirement 7: 用户认证功能测试

**User Story:** As a user, I want to log in to access my saved worksheets, so that I can manage my learning materials.

#### Acceptance Criteria

1. WHEN a user clicks login THEN the system SHALL display Firebase authentication options
2. WHEN authentication succeeds THEN the system SHALL redirect to dashboard
3. WHEN accessing protected routes without authentication THEN the system SHALL redirect to login page
4. WHEN a user logs out THEN the system SHALL clear session and redirect to home

### Requirement 8: 纸张大小自动检测测试

**User Story:** As a user, I want the system to automatically detect my preferred paper size, so that I don't need to configure it manually.

#### Acceptance Criteria

1. WHEN a user from Americas timezone visits THEN the system SHALL default to Letter paper size
2. WHEN a user from Europe/Asia timezone visits THEN the system SHALL default to A4 paper size
3. WHEN paper size detection fails THEN the system SHALL default to Letter paper size

### Requirement 9: 主题资源加载测试

**User Story:** As a developer, I want to verify all theme assets load correctly, so that worksheets display properly.

#### Acceptance Criteria

1. WHEN a theme is selected THEN the system SHALL load theme icon from /uploads/assets/B_character_ip/{theme}/icon/{theme}_icon.png
2. WHEN rendering worksheet pages THEN the system SHALL load all required images without 404 errors
3. IF a theme asset fails to load THEN the system SHALL display a fallback or error indicator

### Requirement 10: 移动端兼容性准备测试

**User Story:** As a developer, I want to identify mobile compatibility issues, so that I can prepare for Capacitor migration.

#### Acceptance Criteria

1. WHEN the application runs on mobile viewport THEN the system SHALL display responsive layouts
2. WHEN touch interactions occur THEN the system SHALL respond appropriately to touch events
3. WHEN the application uses browser APIs THEN the system SHALL use APIs compatible with Capacitor WebView
