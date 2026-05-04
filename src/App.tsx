import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalLoader } from './components/GlobalLoader';

// Lazy loaded routes
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const LiveMap = lazy(() => import('./pages/LiveMap').then(module => ({ default: module.LiveMap })));
const ResourceManagement = lazy(() => import('./pages/ResourceManagement').then(module => ({ default: module.ResourceManagement })));
const AIInsights = lazy(() => import('./pages/AIInsights').then(module => ({ default: module.AIInsights })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Placeholder = lazy(() => import('./pages/Placeholder').then(module => ({ default: module.Placeholder })));
const AlertCenter = lazy(() => import('./pages/AlertCenter').then(module => ({ default: module.AlertCenter })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const NewsIntelligence = lazy(() => import('./pages/NewsIntelligence').then(module => ({ default: module.NewsIntelligence })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));

function AppContent() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AlertProvider>
          {/* BUG-13: Toaster was a sibling of AlertProvider content, not inside it */}
          <Toaster position="bottom-right" />
          <Suspense fallback={<GlobalLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/map" element={<LiveMap />} />
                    <Route path="/alerts" element={<AlertCenter />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/ai" element={<AIInsights />} />
                    <Route path="/news" element={<NewsIntelligence />} />
                    <Route path="/resources" element={<ResourceManagement />} />
                    <Route path="/about" element={<About />} />

                    {/* Admin Only Route */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="/admin" element={<Placeholder title="Admin Panel" description="System configuration and user management." />} />
                    </Route>

                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </AlertProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
