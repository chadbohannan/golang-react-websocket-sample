const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/chat',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      secure: false,
      changeOrigin: true,
    })
  );
};