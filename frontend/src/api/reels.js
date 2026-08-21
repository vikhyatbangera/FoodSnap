import client from './client';

export const listReels = (params) => client.get('/reels', { params }).then((response) => response.data);
export const createReel = (formData, config = {}) => client.post('/reels', formData, { ...config, headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } }).then((response) => response.data);
export const updateReel = (id, formData, config = {}) => client.patch(`/reels/${id}`, formData, { ...config, headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } }).then((response) => response.data);
export const deleteReel = (id) => client.delete(`/reels/${id}`).then((response) => response.data);
export const viewReel = (id) => client.post(`/reels/${id}/view`).then((response) => response.data);
export const toggleLike = (target) => client.post('/likes', { targetType: 'reel', target }).then((response) => response.data);
export const toggleSave = (target) => client.post('/saves', { targetType: 'reel', target }).then((response) => response.data);
