import client from './client';

export const listForFood = (foodId, params) => client.get(`/foods/${foodId}/reviews`, { params }).then((response) => response.data);
