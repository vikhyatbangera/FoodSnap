import client from './client';

export const toggleLike = (targetType, target) => client.post('/likes', { targetType, target }).then((response) => response.data);
export const toggleSave = (targetType, target) => client.post('/saves', { targetType, target }).then((response) => response.data);
