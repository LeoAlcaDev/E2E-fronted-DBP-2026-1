import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: Role;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Cargando...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado pero entra a una ruta que no le corresponde por su rol, lo mandamos
  // a su propio panel en lugar de bloquearlo.
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
  }

  return <>{children}</>;
}
