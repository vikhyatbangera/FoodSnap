import client from './client';

export const getOverview = (params) => client.get('/analytics/overview', { params }).then((response) => response.data);
