import { Link } from 'react-router-dom';

export default function PlaceholderPage({ eyebrow = 'Coming next', title, description = 'This surface is wired and ready for the next feature handoff.' }) {
  return <section className="placeholder-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p><Link className="button button-accent" to="/">Back to discover</Link></section>;
}
