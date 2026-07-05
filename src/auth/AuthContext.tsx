import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';
import type { User } from '../types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchMe(): Promise<User | null> {
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }

  // Si al abrir la app ya hay un token guardado, recuperamos el perfil para conocer el rol
  // antes de decidir qué mostrar.
  useEffect(() => {
    let active = true;
    (async () => {
      if (localStorage.getItem('token')) {
        await fetchMe();
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Guardamos el token y devolvemos el usuario para poder redirigir según su rol.
  async function login(newToken: string): Promise<User> {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const me = await fetchMe();
    if (!me) {
      throw new Error('No se pudo cargar el perfil del usuario');
    }
    return me;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    await fetchMe();
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
