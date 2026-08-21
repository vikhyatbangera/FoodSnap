import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ compact = false }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  function submit(event) {
    event.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  }
  return <form className={`search-bar ${compact ? 'compact' : ''}`} onSubmit={submit}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes, places, cravings…" aria-label="Search dishes, places, cravings" /><button type="submit" aria-label="Submit search">Search</button></form>;
}
