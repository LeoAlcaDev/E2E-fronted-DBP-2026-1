import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import api, { getApiError } from '../api/axios';
import type { RatePayload, Trip } from '../types';
import { btnPrimary, card, fieldLabel, formatDateTime, input } from '../ui';

const POLL_MS = 4000;

export default function PassengerTripDetail() {
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rateError, setRateError] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);

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

  // Mientras el viaje sigue PENDING o IN_PROGRESS refrescamos solos para ver cuándo el
  // conductor lo acepta o lo termina. Al llegar a COMPLETED cortamos el intervalo.
  useEffect(() => {
    if (!trip || trip.status === 'COMPLETED') return;
    const interval = setInterval(fetchTrip, POLL_MS);
    return () => clearInterval(interval);
  }, [trip?.status, fetchTrip]);

  async function handleRate(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setRateError('Selecciona al menos una estrella');
      return;
    }
    setRateError('');
    setRateSubmitting(true);
    try {
      const payload: RatePayload = { rating, comment: comment.trim() || undefined };
      const { data } = await api.post<Trip>(`/trips/${id}/rate`, payload);
      setTrip(data);
    } catch (err) {
      setRateError(getApiError(err, 'No se pudo calificar el viaje'));
    } finally {
      setRateSubmitting(false);
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
        <Link to="/passenger" className="text-black underline">
          Volver al inicio
        </Link>
      </Layout>
    );
  }

  if (!trip) return null;

  const showRatingForm = trip.status === 'COMPLETED' && trip.passengerRating === null;
  const isRated = trip.passengerRating !== null;

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Viaje #{trip.id}</h1>
        <StatusBadge status={trip.status} />
      </div>

      <div className={`${card} mb-4`}>
        <p className="mb-1 text-sm">
          <span className="text-gray-500">Origen:</span> {trip.pickupAddress}
        </p>
        <p className="mb-1 text-sm">
          <span className="text-gray-500">Destino:</span> {trip.dropoffAddress}
        </p>
        <p className="mb-1 text-xs text-gray-500">
          Solicitado: {formatDateTime(trip.requestedAt)}
        </p>
        {trip.acceptedAt && (
          <p className="mb-1 text-xs text-gray-500">
            Aceptado: {formatDateTime(trip.acceptedAt)}
          </p>
        )}
        {trip.completedAt && (
          <p className="text-xs text-gray-500">
            Completado: {formatDateTime(trip.completedAt)}
          </p>
        )}
      </div>

      <div className={`${card} mb-4`}>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Conductor</h2>
        {trip.driver ? (
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {trip.driver.firstName} {trip.driver.lastName}
            </span>
            <span className="text-sm text-gray-700">★ {trip.driver.rating.toFixed(1)}</span>
          </div>
        ) : (
          <p className="text-gray-600">Buscando conductor...</p>
        )}
      </div>

      {(trip.status === 'PENDING' || trip.status === 'IN_PROGRESS') && (
        <p className="mb-4 text-xs text-gray-500">
          Actualizando en tiempo real cada {POLL_MS / 1000}s...
        </p>
      )}

      {showRatingForm && (
        <form onSubmit={handleRate} className={`${card} flex flex-col gap-3`}>
          <h2 className="text-lg font-medium">Califica tu viaje</h2>
          <StarRating value={rating} onChange={setRating} />
          <div>
            <label htmlFor="comment" className={fieldLabel}>
              Comentario (opcional)
            </label>
            <textarea
              id="comment"
              className={input}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo estuvo el viaje?"
            />
          </div>
          {rateError && <p className="text-sm text-gray-800">{rateError}</p>}
          <button type="submit" className={btnPrimary} disabled={rateSubmitting}>
            {rateSubmitting ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </form>
      )}

      {isRated && (
        <div className={card}>
          <h2 className="mb-2 text-lg font-medium">Tu calificación</h2>
          <StarRating value={trip.passengerRating ?? 0} readOnly />
          {trip.ratingComment && (
            <p className="mt-2 text-sm text-gray-700">“{trip.ratingComment}”</p>
          )}
        </div>
      )}
    </Layout>
  );
}
