import axios from 'axios';
import { API_URL } from '../utils/media';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodsnap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodsnap_token');
      localStorage.removeItem('foodsnap_user');
      window.dispatchEvent(new Event('foodsnap:logout'));
    }
    return Promise.reject(error);
  }
);

export default client;
