import client from './client';

export const listFoods = (params) => client.get('/foods', { params }).then((response) => response.data);
export const getFood = (id) => client.get(`/foods/${id}`).then((response) => response.data);
export const createFood = (formData, config = {}) => client.post('/foods', formData, { ...config, headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } }).then((response) => response.data);
export const updateFood = (id, formData, config = {}) => client.patch(`/foods/${id}`, formData, { ...config, headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } }).then((response) => response.data);
export const deleteFood = (id) => client.delete(`/foods/${id}`).then((response) => response.data);
export const listReviews = (id, params) => client.get(`/foods/${id}/reviews`, { params }).then((response) => response.data);
export const createReview = (id, payload) => client.post(`/foods/${id}/reviews`, payload).then((response) => response.data);
