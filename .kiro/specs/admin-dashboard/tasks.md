# Implementation Plan

## Phase 1: Backend Foundation

- [x] 1. Set up admin authentication system


  - [x] 1.1 Create admin middleware for JWT token verification



    - Create `backend/src/middleware/adminAuth.ts`
    - Implement JWT token generation and verification
    - Add admin email whitelist in environment variables
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Write property test for admin authentication


    - **Property 1: Admin Authentication Enforcement**
    - **Validates: Requirements 1.2, 1.3**
  - [x] 1.3 Create admin routes and controller


    - Create `backend/src/routes/admin.ts`
    - Create `backend/src/controllers/adminController.ts`
    - Implement login, logout, verify endpoints
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 2. Implement dashboard statistics API


  - [x] 2.1 Create stats service


    - Create `backend/src/services/adminStatsService.ts`
    - Implement user count aggregation
    - Implement subscription count aggregation
    - Implement daily usage aggregation
    - Implement revenue calculation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 2.2 Write property tests for stats consistency


    - **Property 2: User Count Consistency**
    - **Property 3: Active Subscription Count Consistency**
    - **Validates: Requirements 2.1, 2.2**
  - [x] 2.3 Create stats API endpoints


    - GET /api/admin/stats/overview
    - GET /api/admin/stats/users (growth data)
    - GET /api/admin/stats/usage (daily usage)
    - GET /api/admin/stats/revenue (monthly revenue)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: User & Subscription Management API

- [x] 4. Implement user management API


  - [x] 4.1 Create user management service


    - Create `backend/src/services/adminUserService.ts`
    - Implement paginated user listing
    - Implement user search by email
    - Implement user detail retrieval
    - Implement plan upgrade/downgrade
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 4.2 Write property tests for user management


    - **Property 4: User Search Filter Correctness**
    - **Property 5: User Plan Upgrade Consistency**
    - **Property 6: User Plan Downgrade Consistency**
    - **Validates: Requirements 3.2, 3.4, 3.5**
  - [x] 4.3 Create user management API endpoints


    - GET /api/admin/users (paginated list)
    - GET /api/admin/users/:id (user detail)
    - PUT /api/admin/users/:id/plan (update plan)
    - GET /api/admin/users/:id/usage (usage history)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5. Implement subscription management API


  - [x] 5.1 Create subscription management service


    - Create `backend/src/services/adminSubscriptionService.ts`
    - Implement subscription listing with filters
    - Implement subscription extension
    - Implement subscription cancellation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 5.2 Write property tests for subscription management

    - **Property 7: Subscription List Filter Correctness**
    - **Property 8: Subscription Extension Validity**
    - **Property 9: Subscription Cancellation Consistency**
    - **Validates: Requirements 4.1, 4.3, 4.4**
  - [x] 5.3 Create subscription API endpoints

    - GET /api/admin/subscriptions
    - PUT /api/admin/subscriptions/:id/extend
    - PUT /api/admin/subscriptions/:id/cancel
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implement payment history API

  - [x] 6.1 Create payment service

    - Implement payment listing with filters
    - Implement status filtering
    - _Requirements: 4.5, 4.6_
  - [x] 6.2 Write property test for payment filtering

    - **Property 10: Payment Status Filter Correctness**
    - **Validates: Requirements 4.6**
  - [x] 6.3 Create payment API endpoint

    - GET /api/admin/payments
    - _Requirements: 4.5, 4.6_

- [x] 7. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Content & Delivery Management API

- [x] 8. Implement content statistics API





  - [x] 8.1 Create content stats service

    - Implement worksheet type aggregation
    - Implement theme popularity ranking
    - Implement date range filtering
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.2 Write property tests for content stats

    - **Property 11: Theme Ranking Order**
    - **Property 12: Date Range Filter Correctness**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 8.3 Create content stats API endpoints

    - GET /api/admin/content/stats
    - GET /api/admin/content/themes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Implement weekly delivery management API



  - [x] 9.1 Create delivery management service

    - Implement delivery settings listing
    - Implement manual delivery trigger
    - Implement delivery history retrieval
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.2 Write property test for delivery listing

    - **Property 13: Weekly Delivery List Filter**
    - **Validates: Requirements 6.1**

  - [x] 9.3 Create delivery API endpoints

    - GET /api/admin/delivery/settings
    - POST /api/admin/delivery/trigger
    - GET /api/admin/delivery/history
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: System Config & Export API

- [x] 11. Implement system configuration API



  - [x] 11.1 Create system config service

    - Create Firestore collection for system config
    - Implement config read/write
    - Implement admin action logging
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.2 Write property test for config persistence

    - **Property 14: Configuration Update Persistence**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 11.3 Create system config API endpoints

    - GET /api/admin/config
    - PUT /api/admin/config
    - GET /api/admin/logs
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Implement data export API


  - [x] 12.1 Create export service


    - Implement CSV generation for users
    - Implement CSV generation for subscriptions
    - Implement CSV generation for payments
    - Implement CSV generation for usage
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 12.2 Write property test for export completeness



    - **Property 15: CSV Export Completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
  - [x] 12.3 Create export API endpoints


    - GET /api/admin/export/users
    - GET /api/admin/export/subscriptions
    - GET /api/admin/export/payments
    - GET /api/admin/export/usage
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 13. Checkpoint - Ensure all backend tests pass



  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Frontend Foundation

- [x] 14. Set up admin frontend structure


  - [x] 14.1 Create admin routing and layout


    - Create `src/admin/` directory structure
    - Create AdminLayout component with sidebar
    - Set up admin routes in main router
    - _Requirements: 1.1_
  - [x] 14.2 Create admin authentication context

    - Create AdminAuthContext
    - Implement login/logout flow
    - Implement protected route wrapper
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [x] 14.3 Create admin API service

    - Create `src/admin/services/adminApi.ts`
    - Implement all API calls with auth headers
    - _Requirements: All_

- [x] 15. Implement admin login page


  - [x] 15.1 Create AdminLogin component


    - Email and password form
    - Error handling and display
    - Redirect to dashboard on success
    - _Requirements: 1.1, 1.2_

- [x] 16. Checkpoint - Ensure frontend builds



  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Dashboard & User Management UI

- [x] 17. Implement dashboard overview page


  - [x] 17.1 Create StatsCard component


    - Reusable card for displaying metrics
    - Support for icons and trends
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 17.2 Create chart components


    - LineChart for user growth
    - BarChart for daily usage
    - _Requirements: 2.5, 2.6_
  - [x] 17.3 Create AdminDashboard page


    - Display 4 key metrics cards
    - Display user growth chart
    - Display usage chart
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 18. Implement user management page


  - [x] 18.1 Create DataTable component


    - Reusable table with pagination
    - Support for sorting and filtering
    - _Requirements: 3.1_
  - [x] 18.2 Create UserManagement page


    - User list with search
    - User detail modal
    - Plan upgrade/downgrade buttons
    - Usage history view
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 19. Checkpoint - Ensure frontend builds


  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Subscription & Payment UI

- [x] 20. Implement subscription management page


  - [x] 20.1 Create SubscriptionManagement page


    - Subscription list with search
    - Extend subscription modal
    - Cancel subscription confirmation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 21. Implement payment history page


  - [x] 21.1 Create PaymentHistory page


    - Payment list with status filter
    - Payment detail view
    - _Requirements: 4.5, 4.6_

- [x] 22. Checkpoint - Ensure frontend builds


  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Content & Delivery UI

- [x] 23. Implement content statistics page


  - [x] 23.1 Create ContentStats page


    - Worksheet type ranking
    - Theme popularity chart
    - Date range picker
    - Generation trends chart
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 24. Implement weekly delivery management page


  - [x] 24.1 Create WeeklyDeliveryAdmin page


    - Delivery settings list
    - Manual trigger button
    - Delivery history view
    - Error display and retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 25. Checkpoint - Ensure frontend builds


  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: System Config & Export UI

- [x] 26. Implement system configuration page


  - [x] 26.1 Create SystemConfig page




    - Config form with current values
    - Save button with confirmation
    - System logs viewer
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 27. Implement data export page



  - [x] 27.1 Create DataExport page

    - Export buttons for each data type
    - Date range filter for exports
    - Download progress indicator
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 28. Final Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.
