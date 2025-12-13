# Implementation Plan

- [ ] 1. Update data generator with improved algorithm
  - [ ] 1.1 Refactor generateAlphabetSequencing function in `backend/src/services/generators/index.ts`
    - Update to generate exactly 8 rows
    - Ensure 4 consecutive letters per row
    - Implement starting letter diversity (at least 3 different starting letters)
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.4_
  - [ ]* 1.2 Write property test for row count and structure
    - **Property 1: Row count consistency**
    - **Property 2: Sequence length and consecutiveness**
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 1.3 Write property test for difficulty-based missing count
    - **Property 3: Missing count matches difficulty**
    - **Validates: Requirements 1.3, 1.4, 1.5**
  - [ ]* 1.4 Write property test for alphabet range and diversity
    - **Property 4: Valid alphabet range**
    - **Property 5: Starting letter diversity**
    - **Validates: Requirements 3.2, 3.4**
  - [ ]* 1.5 Write property test for data completeness
    - **Property 6: Data completeness**
    - **Validates: Requirements 6.1**

- [ ] 2. Implement image renderer
  - [ ] 2.1 Update generateAlphabetSequencing method in `backend/src/services/imageGenerator.ts`
    - Render 8 rows of letter sequences
    - Display letters in large clear font (48px+)
    - Render empty boxes with writing guide lines for missing letters
    - Add horizontal writing lines for each row
    - Include theme decorations (stickers, colors, title icon)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_
  - [ ]* 2.2 Write unit test for image generation
    - Test PNG file is created with correct path format
    - _Requirements: 5.1_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 4. Write property test for serialization round-trip
  - [ ]* 4.1 Write property test for JSON serialization
    - **Property 7: Serialization round-trip**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 5. Integration and verification
  - [ ] 5.1 Test end-to-end generation via API
    - Verify worksheet generates correctly through the existing route
    - Test all three difficulty levels
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 6. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
