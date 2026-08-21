export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="button button-ghost" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</button>
      <span>Page {pagination.page} of {pagination.pages}</span>
      <button className="button button-ghost" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</button>
    </nav>
  );
}
