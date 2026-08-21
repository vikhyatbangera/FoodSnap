export default function Toast({ message, onClose }) {
  if (!message) return null;
  return <div className="toast" role="status"><span>{message}</span><button className="icon-button" onClick={onClose} aria-label="Dismiss notification">×</button></div>;
}
