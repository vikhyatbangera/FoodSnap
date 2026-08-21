import client from './client';

export const login = (credentials) => client.post('/auth/login', credentials).then((response) => response.data);
export const register = (payload) => client.post('/auth/register', payload).then((response) => response.data);
export const getMe = () => client.get('/auth/me').then((response) => response.data);
