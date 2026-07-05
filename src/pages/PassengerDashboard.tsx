import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { Trip } from '../types';
import { btnPrimary, formatDateTime } from '../ui';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Trip[]>('/trips');
      setTrips(data);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'No se pudieron cargar tus viajes'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargamos cada pocos segundos para que el estado de cada viaje se refleje solo.
  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {user?.firstName}
          </h1>
          <p className="text-sm text-gray-600">¿A dónde quieres ir hoy?</p>
        </div>
        <Link to="/passenger/request" className={btnPrimary}>
          Pedir viaje
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-medium">Mis viajes</h2>

      {loading && <p className="text-gray-600">Cargando...</p>}
      {error && <p className="text-gray-800">{error}</p>}
      {!loading && !error && trips.length === 0 && (
        <p className="text-gray-600">Aún no tienes viajes. ¡Pide el primero!</p>
      )}

      <ul className="flex flex-col gap-3">
        {trips.map((trip) => (
          <li key={trip.id}>
            <Link
              to={`/passenger/trip/${trip.id}`}
              className="block rounded border border-gray-300 p-4 hover:bg-gray-50"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Viaje #{trip.id}</span>
                <StatusBadge status={trip.status} />
              </div>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">De:</span> {trip.pickupAddress}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">A:</span> {trip.dropoffAddress}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDateTime(trip.requestedAt)}
                {trip.driver ? ` · Conductor: ${trip.driver.firstName}` : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
