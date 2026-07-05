import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { Trip } from '../types';
import { btnPrimary, btnSecondary, card, formatDateTime } from '../ui';

export default function DriverDashboard() {
  const { user, refreshUser } = useAuth();

  const [pending, setPending] = useState<Trip[]>([]);
  const [active, setActive] = useState<Trip | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [pendingRes, myRes] = await Promise.all([
        api.get<Trip[]>('/trips/pending'),
        api.get<Trip[]>('/trips/my'),
      ]);
      setPending(pendingRes.data);
      setActive(myRes.data.find((t) => t.status === 'IN_PROGRESS') ?? null);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'No se pudieron cargar los viajes'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Primera carga y luego un refresco cada pocos segundos para que aparezcan los nuevos
  // viajes pendientes sin recargar la página.
  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleAccept(tripId: number) {
    setError('');
    setAcceptingId(tripId);
    try {
      await api.patch<Trip>(`/trips/${tripId}/accept`);
      // Al aceptar, el conductor queda ocupado, así que volvemos a leer sus listas y su perfil.
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      setError(getApiError(err, 'No se pudo aceptar el viaje'));
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {user?.firstName}
          </h1>
          <p className="text-sm text-gray-600">
            Tu rating: <span className="font-medium text-black">★ {user?.rating.toFixed(1)}</span>
            {user && (
              <span className="ml-2">
                {user.available ? '· Disponible' : '· En viaje'}
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800">
          {error}
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-medium">Viaje activo</h2>
        {active ? (
          <div className={`${card} border-black`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">Viaje #{active.id}</span>
              <StatusBadge status={active.status} />
            </div>
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">De:</span> {active.pickupAddress}
            </p>
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">A:</span> {active.dropoffAddress}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Pasajero: {active.passenger.firstName} {active.passenger.lastName}
            </p>
            <Link to={`/driver/trip/${active.id}`} className={`${btnPrimary} mt-3 inline-block`}>
              Ver / Completar
            </Link>
          </div>
        ) : (
          <p className="text-gray-600">No tienes viajes activos.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Viajes disponibles (PENDING)</h2>
        {loading && <p className="text-gray-600">Cargando...</p>}
        {!loading && pending.length === 0 && (
          <p className="text-gray-600">No hay viajes pendientes por ahora.</p>
        )}
        <ul className="flex flex-col gap-3">
          {pending.map((trip) => (
            <li key={trip.id} className={card}>
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
                Pasajero: {trip.passenger.firstName} · {formatDateTime(trip.requestedAt)}
              </p>
              <button
                onClick={() => handleAccept(trip.id)}
                className={`${btnSecondary} mt-3`}
                disabled={acceptingId === trip.id}
              >
                {acceptingId === trip.id ? 'Aceptando...' : 'Aceptar'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
