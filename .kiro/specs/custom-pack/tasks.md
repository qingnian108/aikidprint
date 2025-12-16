# Implementation Plan

- [x] 1. Set up project structure and routing

  - [x] 1.1 Create CustomPack.tsx page component with basic structure


    - Create new file at `src/pages/CustomPack.tsx`
    - Set up basic React component with state hooks
    - Add floating decorative elements consistent with WeeklyPack style
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Create CustomPackPreview.tsx page component


    - Create new file at `src/pages/CustomPackPreview.tsx`
    - Set up component to receive and display generated pages
    - _Requirements: 7.3, 7.4_
  - [x] 1.3 Add routes to App.tsx


    - Add `/custom-pack` route pointing to CustomPack
    - Add `/custom-pack/preview/:packId` route pointing to CustomPackPreview
    - _Requirements: 1.1_
  - [x] 1.4 Add navigation link in Layout.tsx


    - Add "Custom Pack" to navLinks array
    - _Requirements: 1.1_

- [x] 2. Implement ThemeSelector component

  - [x] 2.1 Create ThemeSelector.tsx component


    - Create new file at `src/components/custom-pack/ThemeSelector.tsx`
    - Display all themes from THEMES constant as horizontal cards
    - Add "Random Theme" option with dice icon
    - Implement selection state with scale and border animations
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 2.2 Write property test for theme selection


    - **Property 1: Theme selection state consistency**
    - **Validates: Requirements 2.2, 2.3**

- [x] 3. Implement CategorySelector component

  - [x] 3.1 Create CategorySelector.tsx component


    - Create new file at `src/components/custom-pack/CategorySelector.tsx`
    - Display all 4 categories as expandable cards with icons and colors
    - Implement expand/collapse with smooth height transition
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 3.2 Write property test for category rendering


    - **Property 2: All categories are rendered**
    - **Validates: Requirements 3.1**

  - [x] 3.3 Write property test for category expansion

    - **Property 3: Category expansion preserves other expansions**
    - **Validates: Requirements 3.4**


- [x] 4. Implement QuantitySelector component
  - [x] 4.1 Create QuantitySelector.tsx component

    - Create new file at `src/components/custom-pack/QuantitySelector.tsx`
    - Implement increment/decrement buttons with min=0
    - Add bounce animation on number change
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.2 Write property test for increment logic


    - **Property 4: Increment increases quantity by exactly 1**
    - **Validates: Requirements 4.1**
  - [x] 4.3 Write property test for decrement with minimum bound

    - **Property 5: Decrement respects minimum bound**
    - **Validates: Requirements 4.2**


- [x] 5. Implement PackSummary component
  - [x] 5.1 Create PackSummary.tsx component


    - Create new file at `src/components/custom-pack/PackSummary.tsx`
    - Display total page count with large font
    - Show category breakdown with color-coded progress bars
    - Handle empty state with encouraging message
    - Animate progress bars on update
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 5.2 Write property test for total count calculation


    - **Property 6: Total count equals sum of selections**
    - **Validates: Requirements 5.1**
  - [x] 5.3 Write property test for category count aggregation

    - **Property 7: Category counts are correctly aggregated**

    - **Validates: Requirements 5.2**

- [x] 6. Implement PresetTemplates component

  - [x] 6.1 Create PresetTemplates.tsx component


    - Create new file at `src/components/custom-pack/PresetTemplates.tsx`
    - Define 3 preset templates (Balanced, Math Focus, Literacy Boost)
    - Display presets as clickable cards
    - Highlight active preset
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Write property test for preset application

    - **Property 8: Preset application sets correct quantities**
    - **Validates: Requirements 6.2, 6.3**
  - [x] 6.3 Write property test for manual change clearing preset

    - **Property 9: Manual change clears active preset**
    - **Validates: Requirements 6.4**


- [x] 7. Checkpoint - Ensure all frontend components work
  - All 55 tests pass across 7 test files.



- [x] 8. Integrate components in CustomPack page

  - [x] 8.1 Assemble all components in CustomPack.tsx


    - Import and render ThemeSelector, CategorySelector, PackSummary, PresetTemplates
    - Wire up state management between components
    - Add Generate button with loading state
    - Implement responsive layout (summary on right for desktop, bottom for mobile)
    - _Requirements: 1.1, 7.1, 7.2_

- [x] 9. Implement backend API
  - [x] 9.1 Create customPack.ts route file


    - Create new file at `backend/src/routes/customPack.ts`
    - Implement POST /api/custom-pack/generate endpoint
    - Implement POST /api/custom-pack/save endpoint
    - Implement GET /api/custom-pack/:packId endpoint
    - _Requirements: 7.1, 10.1_

  - [x] 9.2 Create customPackService.ts

    - Create new file at `backend/src/services/generators/customPackService.ts`
    - Implement generateCustomPack function that calls existing generators
    - Reuse logic from weeklyPackService for page generation
    - _Requirements: 7.1, 7.3_
  - [x] 9.3 Register routes in server


    - Import and use customPack routes in main server file
    - _Requirements: 7.1_
  - [x] 9.4 Write property test for API payload



    - **Property 10: Generate API receives correct payload**
    - **Validates: Requirements 7.1**


  - [x] 9.5 Write property test for generated page count
    - **Property 11: Generated pack page count matches selection total**
    - **Validates: Requirements 7.3**

- [x] 10. Implement CustomPackPreview page
  - [x] 10.1 Complete CustomPackPreview.tsx implementation

    - Fetch pack data from API using packId from URL
    - Display generated pages in grid with staggered animation
    - Add Download and Share buttons
    - _Requirements: 7.3, 7.4, 8.1, 10.2_
  - [x] 10.2 Implement download logic

    - Check user authentication and plan
    - Generate PDF for Pro users using jsPDF
    - Redirect Free users to pricing page
    - Redirect unauthenticated users to login
    - Record download in Firestore
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 10.3 Write property test for download behavior


    - **Property 12: Download behavior based on user plan**
    - **Validates: Requirements 8.1, 8.2**
  - [x] 10.4 Write property test for unauthenticated redirect

    - **Property 13: Unauthenticated download redirects to login**
    - **Validates: Requirements 8.4**


  - [x] 10.5 Implement share logic
    - Generate shareable URL with packId
    - Copy to clipboard on Share button click
    - Show confirmation toast
    - _Requirements: 10.1, 10.2_

  - [x] 10.6 Write property test for share URL format
    - **Property 14: Share URL contains valid pack ID**
    - **Validates: Requirements 10.1**

  - [x] 10.7 Write property test for shared pack loading
    - **Property 15: Shared pack loads correct data**
    - **Validates: Requirements 10.3**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Add animations and polish
  - [x] 12.1 Add entrance animations

    - Add staggered fade-in for category cards
    - Add slide-in for summary panel
    - Add pop-in for preset cards
    - _Requirements: 9.1_

  - [x] 12.2 Add interaction animations
    - Add hover effects (shadow-brutal, scale, translate)
    - Add bounce effect on quantity change
    - Add smooth height transition for category expand/collapse
    - _Requirements: 9.2, 9.3, 9.4_

  - [x] 12.3 Add loading animations
    - Add spinner during generation
    - Add progress indication showing page generation status
    - _Requirements: 7.2_

- [x] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
