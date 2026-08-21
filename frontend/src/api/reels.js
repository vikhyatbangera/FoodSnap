import client from './client';

export const listReels = (params) => client.get('/reels', { params }).then((response) => response.data);
export const createReel = (formData) => client.post('/reels', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((response) => response.data);
export const updateReel = (id, formData) => client.patch(`/reels/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((response) => response.data);
export const deleteReel = (id) => client.delete(`/reels/${id}`).then((response) => response.data);
export const viewReel = (id) => client.post(`/reels/${id}/view`).then((response) => response.data);
