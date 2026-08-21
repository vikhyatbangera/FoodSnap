export default function EmptyState({ title = 'Nothing here yet', message = 'Check back soon for something delicious.', action }) {
  return (
    <div className="empty-state">
      <span className="empty-emoji">✦</span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
