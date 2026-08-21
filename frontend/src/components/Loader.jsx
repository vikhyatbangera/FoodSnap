export default function Loader({ label = 'Loading your next bite…' }) {
  return <div className="loader-wrap" role="status"><span className="spinner" /> <span>{label}</span></div>;
}
