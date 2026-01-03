import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SmoothScroll from './components/SmoothScroll';
import Home from './pages/Home';
import GeneratorHome from './pages/generator/GeneratorHome';
import CategoryPage from './pages/generator/CategoryPage';
import GeneratorDetail from './pages/generator/GeneratorDetail';
import NamePreview from './pages/NamePreview';
import Subscribe from './pages/Subscribe';
import WeeklyPack from './pages/WeeklyPack';
import WeeklyPackPreview from './pages/WeeklyPackPreview';
import CustomPack from './pages/CustomPack';
import CustomPackPreview from './pages/CustomPackPreview';
import Library from './pages/Library';
import Pricing from './pages/Pricing';
import DashboardNew from './pages/DashboardNew';
import FreeResources from './pages/FreeResources';
import Login from './pages/Login';
import MyWorksheets from './pages/MyWorksheets';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin imports (lazy loaded)
import { AdminAuthProvider } from './admin/contexts/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('./admin/pages/UserManagement'));
const SubscriptionManagement = lazy(() => import('./admin/pages/SubscriptionManagement'));
const PaymentHistory = lazy(() => import('./admin/pages/PaymentHistory'));
const ContentStats = lazy(() => import('./admin/pages/ContentStats'));
const WeeklyDeliveryAdmin = lazy(() => import('./admin/pages/WeeklyDeliveryAdmin'));
const SystemConfig = lazy(() => import('./admin/pages/SystemConfig'));
const DataExport = lazy(() => import('./admin/pages/DataExport'));

// Admin loading fallback
const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <SmoothScroll />
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminAuthProvider>
                  <Suspense fallback={<AdminLoading />}>
                    <Routes>
                      <Route path="login" element={<AdminLogin />} />
                      <Route
                        element={
                          <AdminProtectedRoute>
                            <AdminLayout />
                          </AdminProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="subscriptions" element={<SubscriptionManagement />} />
                        <Route path="payments" element={<PaymentHistory />} />
                        <Route path="content" element={<ContentStats />} />
                        <Route path="delivery" element={<WeeklyDeliveryAdmin />} />
                        <Route path="config" element={<SystemConfig />} />
                        <Route path="export" element={<DataExport />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </AdminAuthProvider>
              }
            />

            {/* Main App Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />

              {/* Generator Routes */}
              <Route path="generator">
                <Route index element={<GeneratorHome />} />
                <Route path=":categoryId" element={<CategoryPage />} />
                <Route path=":categoryId/:typeId" element={<GeneratorDetail />} />
              </Route>

              {/* New Conversion Flow Routes */}
              <Route path="preview/:name" element={<NamePreview />} />
              <Route path="subscribe" element={<Subscribe />} />

              {/* Main Feature Routes */}
              <Route path="weekly-pack" element={<WeeklyPack />} />
              <Route path="weekly-pack/preview/:packId" element={<WeeklyPackPreview />} />
              <Route path="custom-pack" element={<CustomPack />} />
              <Route path="custom-pack/preview/:packId" element={<CustomPackPreview />} />
              <Route path="library" element={<Library />} />

              <Route path="pricing" element={<Pricing />} />
              <Route path="free-resources" element={<FreeResources />} />
              <Route path="login" element={<Login />} />
              <Route path="my-worksheets" element={<MyWorksheets />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardNew />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;