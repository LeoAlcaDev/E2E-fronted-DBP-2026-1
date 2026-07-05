import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api, { getApiError } from '../api/axios';
import type { CreateTripPayload, Trip, User } from '../types';
import { btnPrimary, btnSecondary, card, fieldLabel, input } from '../ui';

export default function RequestTripPage() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

  const [pickupAddress, setPickup] = useState('');
  const [dropoffAddress, setDropoff] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mostramos los conductores disponibles antes de que el pasajero confirme el viaje.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<User[]>('/drivers/available');
        if (active) setDrivers(data);
      } catch {
        // Si esto falla no es grave: el pasajero igual puede pedir su viaje.
        if (active) setDrivers([]);
      } finally {
        if (active) setDriversLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: CreateTripPayload = { pickupAddress, dropoffAddress };
      const { data } = await api.post<Trip>('/trips', payload);
      navigate(`/passenger/trip/${data.id}`, { replace: true });
    } catch (err) {
      setError(getApiError(err, 'No se pudo crear el viaje'));
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Pedir un viaje</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-medium">Conductores disponibles</h2>
          {driversLoading && <p className="text-gray-600">Cargando...</p>}
          {!driversLoading && drivers.length === 0 && (
            <p className="text-gray-600">No hay conductores disponibles ahora mismo.</p>
          )}
          <ul className="flex flex-col gap-2">
            {drivers.map((d) => (
              <li key={d.id} className={`${card} flex items-center justify-between`}>
                <span className="font-medium">
                  {d.firstName} {d.lastName}
                </span>
                <span className="text-sm text-gray-700">★ {d.rating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium">Detalles del viaje</h2>
          {error && (
            <div className="mb-4 rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="pickup" className={fieldLabel}>
                Origen (pickup)
              </label>
              <input
                id="pickup"
                className={input}
                value={pickupAddress}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Av. Javier Prado 100"
                required
              />
            </div>
            <div>
              <label htmlFor="dropoff" className={fieldLabel}>
                Destino (dropoff)
              </label>
              <input
                id="dropoff"
                className={input}
                value={dropoffAddress}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Miraflores, Lima"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className={btnPrimary} disabled={submitting}>
                {submitting ? 'Solicitando...' : 'Confirmar viaje'}
              </button>
              <Link to="/passenger" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
