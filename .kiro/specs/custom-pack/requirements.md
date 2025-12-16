# Requirements Document

## Introduction

Custom Pack Builder 是一个让用户能够自主定制学习合集的功能。与现有的 Weekly Pack（系统自动生成）不同，Custom Pack 允许用户精确控制合集中每种 worksheet 类型的数量，实现个性化的学习内容配比。用户可以从 4 大分类（Literacy、Math、Logic、Creativity）中自由选择，调整每种类型的页数，最终生成一个完全符合孩子学习需求的定制合集。

## Glossary

- **Custom_Pack_Builder**: 自定义合集构建器，允许用户选择和配置 worksheet 类型及数量的系统
- **Category**: 分类，包括 Literacy Skills、Math Skills、Logic & Thinking、Creativity & Motor 四大类
- **Page_Type**: 页面类型，每个分类下的具体 worksheet 模板（如 uppercase-tracing、maze 等）
- **Selection_State**: 选择状态，记录用户选择的每种 page type 及其数量
- **Pack_Summary**: 合集摘要，显示当前选择的总页数和各分类占比
- **Preset_Template**: 预设模板，系统提供的推荐配比方案

## Requirements

### Requirement 1

**User Story:** As a parent, I want to access the Custom Pack Builder from the main navigation, so that I can easily find and use the customization feature.

#### Acceptance Criteria

1. WHEN a user navigates to `/custom-pack` THEN the Custom_Pack_Builder SHALL display the main configuration interface with theme selection at the top
2. WHEN the Custom_Pack_Builder loads THEN the system SHALL display floating decorative elements with smooth animations
3. WHEN a user views the page header THEN the system SHALL display a title "Build Your Custom Pack" with animated sparkle effects and a brief description

### Requirement 2

**User Story:** As a parent, I want to quickly select a theme for my custom pack, so that I can start building my pack without unnecessary steps.

#### Acceptance Criteria

1. WHEN the theme selection section loads THEN the Custom_Pack_Builder SHALL display all available themes as compact selectable cards in a horizontal row
2. WHEN a user clicks on a theme card THEN the Custom_Pack_Builder SHALL highlight the selected theme with scale animation and border highlight
3. WHEN a user clicks the "Random Theme" option THEN the Custom_Pack_Builder SHALL randomly select one theme with a shuffle animation effect
4. WHEN no theme is selected THEN the Custom_Pack_Builder SHALL default to "Random Theme" mode allowing generation with a randomly assigned theme

### Requirement 3

**User Story:** As a parent, I want to see all available worksheet categories and types, so that I can understand what options are available for my custom pack.

#### Acceptance Criteria

1. WHEN the category selection section loads THEN the Custom_Pack_Builder SHALL display all 4 categories (Literacy, Math, Logic, Creativity) as expandable cards with their respective icons and colors
2. WHEN a user clicks on a category card THEN the Custom_Pack_Builder SHALL expand the card with smooth animation to reveal all page types within that category
3. WHEN a category is expanded THEN the Custom_Pack_Builder SHALL display each page type with its title, description, and a quantity selector
4. WHEN multiple categories are expanded THEN the Custom_Pack_Builder SHALL allow all expanded categories to remain visible simultaneously

### Requirement 4

**User Story:** As a parent, I want to adjust the quantity of each worksheet type, so that I can customize the exact content mix of my pack.

#### Acceptance Criteria

1. WHEN a user clicks the increment button on a page type THEN the Custom_Pack_Builder SHALL increase the quantity by 1 and update the Pack_Summary immediately
2. WHEN a user clicks the decrement button on a page type THEN the Custom_Pack_Builder SHALL decrease the quantity by 1 (minimum 0) and update the Pack_Summary immediately
3. WHEN a page type quantity is greater than 0 THEN the Custom_Pack_Builder SHALL highlight that page type card with a colored border and badge showing the count
4. WHEN quantity changes occur THEN the Custom_Pack_Builder SHALL animate the number change with a subtle scale effect

### Requirement 5

**User Story:** As a parent, I want to see a real-time summary of my selections, so that I can track my pack composition as I build it.

#### Acceptance Criteria

1. WHEN selections change THEN the Pack_Summary SHALL display the total page count with animated number transition
2. WHEN selections change THEN the Pack_Summary SHALL display a breakdown showing count per category with color-coded progress bars
3. WHEN the total page count is 0 THEN the Pack_Summary SHALL display an empty state message encouraging the user to add pages
4. WHEN the Pack_Summary updates THEN the system SHALL animate the progress bars smoothly to reflect new proportions

### Requirement 6

**User Story:** As a parent, I want to use preset templates for quick pack creation, so that I can save time when I don't want to manually configure everything.

#### Acceptance Criteria

1. WHEN the preset section loads THEN the Custom_Pack_Builder SHALL display at least 3 preset templates (e.g., "Balanced Learning", "Math Focus", "Literacy Boost")
2. WHEN a user clicks a preset template THEN the Custom_Pack_Builder SHALL populate all page type quantities according to the preset configuration with animation
3. WHEN a preset is applied THEN the Custom_Pack_Builder SHALL highlight the active preset and update the Pack_Summary
4. WHEN a user manually changes any quantity after applying a preset THEN the Custom_Pack_Builder SHALL deselect the preset indicator

### Requirement 7

**User Story:** As a parent, I want to generate and preview my custom pack, so that I can see what the final result looks like before downloading.

#### Acceptance Criteria

1. WHEN a user clicks the Generate button with valid selections THEN the Custom_Pack_Builder SHALL call the backend API with the selection configuration
2. WHEN generation is in progress THEN the Custom_Pack_Builder SHALL display a loading animation with progress indication showing which pages are being generated
3. WHEN generation completes successfully THEN the Custom_Pack_Builder SHALL navigate to a preview page displaying all generated worksheet thumbnails in a grid
4. WHEN the preview page loads THEN the system SHALL display each page with staggered fade-in animation

### Requirement 8

**User Story:** As a parent, I want to download my custom pack as a PDF, so that I can print the worksheets for my child.

#### Acceptance Criteria

1. WHEN a Pro user clicks Download on the preview page THEN the system SHALL generate a PDF containing all selected worksheets and initiate download
2. WHEN a Free user clicks Download THEN the system SHALL redirect to the pricing page with a message about upgrading
3. WHEN download completes THEN the system SHALL record the download in the user's history
4. WHEN a user is not logged in and clicks Download THEN the system SHALL redirect to the login page with return URL preserved

### Requirement 9

**User Story:** As a parent, I want the Custom Pack Builder to have smooth animations and visual feedback, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. WHEN page elements load THEN the Custom_Pack_Builder SHALL apply staggered entrance animations to cards and sections
2. WHEN a user hovers over interactive elements THEN the Custom_Pack_Builder SHALL display hover effects consistent with the brutal design system (shadow-brutal, scale, translate)
3. WHEN quantity values change THEN the Custom_Pack_Builder SHALL animate the number with a bounce or scale effect
4. WHEN categories expand or collapse THEN the Custom_Pack_Builder SHALL use smooth height transitions with easing

### Requirement 10

**User Story:** As a parent, I want to share my custom pack with others, so that they can see or use the same configuration.

#### Acceptance Criteria

1. WHEN a pack is generated THEN the system SHALL create a unique shareable URL for the pack
2. WHEN a user clicks the Share button THEN the system SHALL copy the share URL to clipboard and display a confirmation toast
3. WHEN someone visits a shared pack URL THEN the system SHALL display the pack preview page with download options
