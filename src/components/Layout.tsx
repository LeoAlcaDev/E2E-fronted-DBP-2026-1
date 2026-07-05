import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const home = user?.role === 'DRIVER' ? '/driver' : '/passenger';

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-300">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to={home} className="text-lg font-semibold tracking-tight">
            UberFake
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/history" className="text-gray-600 hover:text-black">
              Historial
            </Link>
            {user && <span className="text-gray-600">{user.firstName}</span>}
            <button
              onClick={handleLogout}
              className="rounded border border-black px-3 py-1 hover:bg-gray-100"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
