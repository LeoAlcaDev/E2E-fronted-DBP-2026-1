interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

// Muestra las estrellas y, cuando recibe onChange, deja que el usuario elija la calificación.
export default function StarRating({ value, onChange, readOnly }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = !readOnly && !!onChange;

  return (
    <div className="flex gap-1">
      {stars.map((star) => {
        const filled = star <= value;
        if (!interactive) {
          return (
            <span key={star} className="text-xl text-black">
              {filled ? '★' : '☆'}
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`${star} de 5 estrellas`}
            className="text-2xl leading-none text-black hover:text-gray-500 focus:outline-none"
          >
            {filled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
