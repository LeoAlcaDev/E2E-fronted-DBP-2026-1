import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 quiere decir que el token ya no sirve, así que cerramos la sesión y volvemos
    // al login. Un 403 es distinto: el usuario sí está autenticado pero pidió algo que su
    // rol no permite, y en ese caso no lo sacamos de la sesión.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// El backend manda los errores como { error: "mensaje" }, salvo los de validación que llegan
// como { campo: "mensaje" }. Aquí sacamos un texto legible para cualquiera de los dos casos.
export function getApiError(err: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.error === 'string') return record.error;
      const firstField = Object.values(record).find((v) => typeof v === 'string');
      if (typeof firstField === 'string') return firstField;
    }
    if (err.message) return err.message;
  }
  return fallback;
}

export default api;
