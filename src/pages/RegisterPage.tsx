import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { AuthResponse, RegisterPayload, Role } from '../types';
import { btnPrimary, fieldLabel, input } from '../ui';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: RegisterPayload = { firstName, lastName, email, password, role };
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      const user = await login(data.token);
      navigate(user.role === 'DRIVER' ? '/driver' : '/passenger', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'No se pudo registrar'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-black">
      <div className="w-full max-w-sm rounded border border-gray-300 p-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">Regístrate como pasajero o conductor</p>

        {error && (
          <div className="mb-4 rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="firstName" className={fieldLabel}>
              Nombre
            </label>
            <input
              id="firstName"
              className={input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className={fieldLabel}>
              Apellido
            </label>
            <input
              id="lastName"
              className={input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
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
              minLength={6}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres.</p>
          </div>
          <div>
            <label htmlFor="role" className={fieldLabel}>
              Rol
            </label>
            <select
              id="role"
              className={input}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="PASSENGER">Pasajero</option>
              <option value="DRIVER">Conductor</option>
            </select>
          </div>
          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? 'Creando...' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-black underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
