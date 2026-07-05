import type { TripStatus } from '../types';

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
};

const STYLES: Record<TripStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border border-gray-300',
  IN_PROGRESS: 'bg-black text-white',
  COMPLETED: 'bg-white text-black border border-black',
};

export default function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
