import client from './client';

export const listPartners = (params) => client.get('/partners', { params }).then((response) => response.data);
export const getPartner = (id) => client.get(`/partners/${id}`).then((response) => response.data);
export const updatePartner = (payload) => client.patch('/partners/me', payload).then((response) => response.data);
