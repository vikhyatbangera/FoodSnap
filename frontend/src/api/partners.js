import client from './client';

export const listPartners = (params) => client.get('/partners', { params }).then((response) => response.data);
export const getPartner = (id) => client.get(`/partners/${id}`).then((response) => response.data);
export const updatePartner = (payload, config = {}) => client.patch('/partners/me', payload, { ...config, headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } : config.headers }).then((response) => response.data);
