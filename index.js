const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Proxy route: /namantest -> https://bb.online/namanTest/dashboard.php
app.use('/namantest', createProxyMiddleware({
  target: 'https://bigbucket.online',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/namantest': '/namanTest/dashboard.php', // Rewrites local /namantest to remote /namanTest/dashboard.php
  },
  cookieDomainRewrite: '', // remove domain from set-cookie headers
  onProxyRes(proxyRes) {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      proxyRes.headers['set-cookie'] = cookies.map(cookie =>
        cookie
          .replace(/Domain=\.?bigbucket\.online/i, '') // Remove domain
          .replace(/; secure/gi, '') // Allow for HTTP and proxies
      );
    }
  },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
