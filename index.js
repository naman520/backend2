const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/namantest', createProxyMiddleware({
  target: 'https://bigbucket.online', // ← real PHP domain here
  changeOrigin: true,
  secure: false,
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://bigbucket.online',
  },
  pathRewrite: {
    '^/namantest': '/namanTest/dashboard.php', // or any real path
  },
  cookieDomainRewrite: '', // strips domain so cookies apply to proxy
  onProxyRes(proxyRes) {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      proxyRes.headers['set-cookie'] = cookies.map(cookie =>
        cookie.replace(/Domain=\.?bigbucket\.online/i, '').replace(/; secure/gi, '')
      );
    }
  },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy listening on port ${PORT}`);
});
