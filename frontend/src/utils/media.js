export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const SERVER_URL = API_URL.replace(/\/api$/, '');

// Media is stored as a path (or as a localhost URL by older seeds), so resolve
// everything against the API host the app is actually talking to.
export function mediaUrl(value) {
  if (!value) return undefined;
  const localhost = value.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localhost) return `${SERVER_URL}${localhost[3]}`;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${SERVER_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}
