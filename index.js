const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Proxy route
app.use('/namantest', createProxyMiddleware({
  target: 'https://bigbucket.online/namanTest',
  changeOrigin: true,
  secure: false,
  cookieDomainRewrite: 'https://bma-dholera-sir.onrender.com', // Rewrite to current domain
  pathRewrite: { '^/namantest': '/dashboard.php' },
  onProxyRes(proxyRes) {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      proxyRes.headers['set-cookie'] = cookies.map(cookie =>
        cookie
          .replace(/Domain=\.?bigbucket\.online\namanTest/i, '') // remove Domain attribute
          .replace(/; secure/gi, '') // allow on HTTP too
      );
    }
  },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
