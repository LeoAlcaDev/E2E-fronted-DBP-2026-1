export const input =
  'w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none';

export const btnPrimary =
  'rounded bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const btnSecondary =
  'rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50';

export const card = 'rounded border border-gray-300 p-4';

export const fieldLabel = 'mb-1 block text-sm font-medium text-gray-700';

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}
