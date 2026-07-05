import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PassengerDashboard from './pages/PassengerDashboard';
import RequestTripPage from './pages/RequestTripPage';
import PassengerTripDetail from './pages/PassengerTripDetail';
import DriverDashboard from './pages/DriverDashboard';
import DriverTripDetail from './pages/DriverTripDetail';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

function RootRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-gray-600">Cargando...</div>;
  }
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/passenger"
            element={
              <ProtectedRoute role="PASSENGER">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger/request"
            element={
              <ProtectedRoute role="PASSENGER">
                <RequestTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger/trip/:id"
            element={
              <ProtectedRoute role="PASSENGER">
                <PassengerTripDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute role="DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/trip/:id"
            element={
              <ProtectedRoute role="DRIVER">
                <DriverTripDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
