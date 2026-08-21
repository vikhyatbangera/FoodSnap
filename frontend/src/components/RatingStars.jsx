export default function RatingStars({ value = 0, count, size = 'normal' }) {
  const rounded = Math.round(value);
  return (
    <span className={`rating-stars ${size}`} aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= rounded ? 'filled' : ''}>★</span>)}</span>
      <small>{Number(value).toFixed(1)}{count !== undefined ? ` (${count})` : ''}</small>
    </span>
  );
}
