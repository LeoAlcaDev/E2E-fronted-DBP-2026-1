import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { Trip } from '../types';
import { btnPrimary, card, formatDateTime } from '../ui';

export default function DriverTripDetail() {
  const { id } = useParams<{ id: string }>();
  const { refreshUser } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchTrip = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get<Trip>(`/trips/${id}`);
      setTrip(data);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'No se pudo cargar el viaje'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  async function handleComplete() {
    setError('');
    setCompleting(true);
    try {
      const { data } = await api.patch<Trip>(`/trips/${id}/complete`);
      setTrip(data);
      // Al terminar el viaje el conductor vuelve a estar disponible, así que recargamos su perfil.
      await refreshUser();
    } catch (err) {
      setError(getApiError(err, 'No se pudo completar el viaje'));
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-600">Cargando...</p>
      </Layout>
    );
  }

  if (error && !trip) {
    return (
      <Layout>
        <p className="mb-4 text-gray-800">{error}</p>
        <Link to="/driver" className="text-black underline">
          Volver al inicio
        </Link>
      </Layout>
    );
  }

  if (!trip) return null;

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Viaje #{trip.id}</h1>
        <StatusBadge status={trip.status} />
      </div>

      {error && (
        <div className="mb-4 rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800">
          {error}
        </div>
      )}

      <div className={`${card} mb-4`}>
        <p className="mb-1 text-sm">
          <span className="text-gray-500">Origen:</span> {trip.pickupAddress}
        </p>
        <p className="mb-1 text-sm">
          <span className="text-gray-500">Destino:</span> {trip.dropoffAddress}
        </p>
        <p className="text-xs text-gray-500">Solicitado: {formatDateTime(trip.requestedAt)}</p>
        {trip.acceptedAt && (
          <p className="text-xs text-gray-500">Aceptado: {formatDateTime(trip.acceptedAt)}</p>
        )}
        {trip.completedAt && (
          <p className="text-xs text-gray-500">Completado: {formatDateTime(trip.completedAt)}</p>
        )}
      </div>

      <div className={`${card} mb-4`}>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Pasajero</h2>
        <p className="font-medium">
          {trip.passenger.firstName} {trip.passenger.lastName}
        </p>
        <p className="text-sm text-gray-600">{trip.passenger.email}</p>
      </div>

      {trip.status === 'IN_PROGRESS' && (
        <button onClick={handleComplete} className={btnPrimary} disabled={completing}>
          {completing ? 'Completando...' : 'Completar viaje'}
        </button>
      )}

      {trip.status === 'COMPLETED' && (
        <div className={card}>
          <h2 className="mb-2 text-lg font-medium">Resumen del viaje</h2>
          <p className="text-sm text-gray-700">El viaje se completó correctamente.</p>
          <p className="text-sm text-gray-700">
            Aceptado {formatDateTime(trip.acceptedAt)}, completado {formatDateTime(trip.completedAt)}.
          </p>
          {trip.passengerRating !== null && (
            <p className="mt-2 text-sm text-gray-700">
              Calificación del pasajero: ★ {trip.passengerRating}
              {trip.ratingComment ? ` “${trip.ratingComment}”` : ''}
            </p>
          )}
        </div>
      )}

      {trip.status === 'PENDING' && (
        <p className="text-gray-600">
          Este viaje aún está pendiente. Acéptalo desde el panel para poder completarlo.
        </p>
      )}
    </Layout>
  );
}
