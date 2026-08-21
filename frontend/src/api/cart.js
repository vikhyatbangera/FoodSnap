import client from './client';

export const getCart = () => client.get('/cart').then((response) => response.data);
export const addCartItem = (foodId, quantity = 1) => client.post('/cart/items', { foodId, quantity }).then((response) => response.data);
export const updateCartItem = (foodId, quantity) => client.patch(`/cart/items/${foodId}`, { quantity }).then((response) => response.data);
export const removeCartItem = (foodId) => client.delete(`/cart/items/${foodId}`).then((response) => response.data);
export const clearCart = () => client.delete('/cart').then((response) => response.data);
