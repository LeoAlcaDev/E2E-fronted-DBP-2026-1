import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { Trip, TripStatus } from '../types';
import { btnSecondary, formatDateTime } from '../ui';

type Filter = 'ALL' | TripStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendiente' },
  { key: 'IN_PROGRESS', label: 'En progreso' },
  { key: 'COMPLETED', label: 'Completado' },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isDriver = user?.role === 'DRIVER';

  const load = useCallback(async () => {
    if (!user) return;
    try {
      // El conductor ve sus viajes con /trips/my y el pasajero los suyos con /trips.
      const endpoint = user.role === 'DRIVER' ? '/trips/my' : '/trips';
      const { data } = await api.get<Trip[]>(endpoint);
      setTrips(data);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'No se pudo cargar el historial'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter],
  );

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Historial de viajes</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Se actualiza solo cada 5s</span>
          <button onClick={load} className={`${btnSecondary} text-sm`}>
            Actualizar
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded border px-3 py-1 text-sm ${
              filter === f.key
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-600">Cargando...</p>}
      {error && <p className="text-gray-800">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-600">No hay viajes para este filtro.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Origen</th>
                <th className="py-2 pr-4 font-medium">Destino</th>
                <th className="py-2 pr-4 font-medium">{isDriver ? 'Pasajero' : 'Conductor'}</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium">Solicitado</th>
                <th className="py-2 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-200">
                  <td className="py-2 pr-4">{trip.id}</td>
                  <td className="py-2 pr-4">{trip.pickupAddress}</td>
                  <td className="py-2 pr-4">{trip.dropoffAddress}</td>
                  <td className="py-2 pr-4">
                    {isDriver
                      ? `${trip.passenger.firstName} ${trip.passenger.lastName}`
                      : trip.driver
                        ? `${trip.driver.firstName} ${trip.driver.lastName}`
                        : '—'}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{formatDateTime(trip.requestedAt)}</td>
                  <td className="py-2">
                    {trip.passengerRating !== null ? `★ ${trip.passengerRating}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
