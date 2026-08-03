import app from './index';

console.log('🚀 Server starting on http://localhost:3000');

export default {
  port: 3000,
  fetch: app.fetch,
};
