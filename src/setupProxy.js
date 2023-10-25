/* eslint-disable no-param-reassign */
// const { createProxyMiddleware } = require('http-proxy-middleware'); // eslint-disable-line import/no-extraneous-dependencies

// const VIDISPINE_ENDPOINTS = ['/API/', '/APInoauth/', '/APIinit/', '/APIdoc/', '/UploadLicense/'];

// const VIDISPINE_URL =
//   process.env.REACT_APP_VIDISPINE_URL === '' ? undefined : process.env.REACT_APP_VIDISPINE_URL;

// const onProxyRes = (proxyRes) => delete proxyRes.headers['www-authenticate']; // eslint-disable-line no-param-reassign

// function useProxy(app) {
//   if (VIDISPINE_URL) {
//     app.use(
//       createProxyMiddleware(VIDISPINE_ENDPOINTS, {
//         target: VIDISPINE_URL,
//         changeOrigin: true,
//         onProxyRes,
//       }),
//     );
//   }
// }

// module.exports = useProxy;

const { createProxyMiddleware } = require('http-proxy-middleware'); // eslint-disable-line import/no-extraneous-dependencies

const onProxyRes = (proxyRes) => {
  console.log('Proxy Response Headers:', proxyRes.headers); // Logging, remove in production
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
};

const onError = (err, req, res) => {
  console.error('Proxy encountered an error', err);
  res.status(500);
  res.json({ error: 'Proxy Error', details: err.toString() });
};

function useProxy(app) {
  app.use(
    createProxyMiddleware('/api', {
      target: 'https://api.deepva.com',
      changeOrigin: true,
      onProxyRes,
      onError,
      timeout: 5000, // 5 seconds timeout
    }),
  );
}

module.exports = useProxy;
