import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/common/LoadingSpinner';
import { BottomNav } from './components/common/BottomNav';
import { Login } from './pages/Login';
import { CoupleSetup } from './pages/CoupleSetup';
import { Swipe } from './pages/Swipe';
import { WatchList } from './pages/WatchList';
import { Profile } from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function CoupleProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, couple, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!couple) {
    return <Navigate to="/couple-setup" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, couple, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/swipe" replace /> : <Login />}
      />
      <Route
        path="/couple-setup"
        element={
          <ProtectedRoute>
            {couple ? <Navigate to="/swipe" replace /> : <CoupleSetup />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/join/:inviteCode"
        element={
          <ProtectedRoute>
            <CoupleSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/swipe"
        element={
          <CoupleProtectedRoute>
            <Swipe />
            <BottomNav />
          </CoupleProtectedRoute>
        }
      />
      <Route
        path="/watchlist"
        element={
          <CoupleProtectedRoute>
            <WatchList />
            <BottomNav />
          </CoupleProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <CoupleProtectedRoute>
            <Profile />
            <BottomNav />
          </CoupleProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user ? (
            couple ? (
              <Navigate to="/swipe" replace />
            ) : (
              <Navigate to="/couple-setup" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
