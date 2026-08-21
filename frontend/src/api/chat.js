import client from './client';

export const sendMessage = (message) => client.post('/chat', { message }).then((response) => response.data);
