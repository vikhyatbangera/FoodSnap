export function HeartIcon({ filled = false }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={filled ? 'interaction-icon filled' : 'interaction-icon'}><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
}

export function BookmarkIcon({ filled = false }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={filled ? 'interaction-icon filled' : 'interaction-icon'}><path d="M6.5 4.5A2.5 2.5 0 0 1 9 2h6a2.5 2.5 0 0 1 2.5 2.5V21L12 17.5 6.5 21V4.5Z" /></svg>;
}
