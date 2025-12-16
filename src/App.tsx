import React from 'react';
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <SmoothScroll />
          <Routes>
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