import client from './client';

export const updateMe = (formData) => client.patch('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((response) => response.data);
export const updateSettings = (payload) => client.patch('/users/me/settings', payload).then((response) => response.data);
export const getSaved = () => client.get('/users/me/saved').then((response) => response.data);
