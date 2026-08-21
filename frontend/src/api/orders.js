import client from './client';

export const placeOrder = (payload) => client.post('/orders', payload).then((response) => response.data);
export const listMyOrders = (params) => client.get('/orders/mine', { params }).then((response) => response.data);
export const getOrder = (id) => client.get(`/orders/${id}`).then((response) => response.data);
export const listPartnerOrders = (params) => client.get('/orders/partner', { params }).then((response) => response.data);
export const updateOrderStatus = (id, status) => client.patch(`/orders/${id}/status`, { status }).then((response) => response.data);
