import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { AuthResponse, LoginPayload } from '../types';
import { btnPrimary, fieldLabel, input } from '../ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: LoginPayload = { email, password };
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      const user = await login(data.token);
      navigate(user.role === 'DRIVER' ? '/driver' : '/passenger', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'No se pudo iniciar sesión'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-black">
      <div className="w-full max-w-sm rounded border border-gray-300 p-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">UberFake</h1>
        <p className="mb-6 text-sm text-gray-600">Inicia sesión para continuar</p>

        {error && (
          <div className="mb-4 rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={fieldLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@uber.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className={fieldLabel}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="pass123"
              required
            />
          </div>
          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-black underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
