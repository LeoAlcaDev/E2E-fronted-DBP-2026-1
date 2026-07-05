import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-black">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <p className="text-gray-600">Página no encontrada</p>
      <Link to="/" className="text-black underline">
        Volver al inicio
      </Link>
    </div>
  );
}
