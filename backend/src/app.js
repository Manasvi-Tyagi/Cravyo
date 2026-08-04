//create server 
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { isRedisAvailable } = require('./services/redis.service');
const { isSearchAvailable } = require('./services/search.service');

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allowedOrigins = config.frontendUrl.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/product', require('./routes/product.routes'));
app.use('/api/merchant', require('./routes/merchant.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// Backward compat: old /api/food and /api/food-partner paths still work
app.use('/api/food', require('./routes/product.routes'));
app.use('/api/food-partner', require('./routes/merchant.routes'));

app.get('/', (req, res) => res.send("Cravyo API is running"));
app.get('/api/health', (req, res) => {
  const dependencies = {
    mongodb: require('mongoose').connection.readyState === 1,
    redis: isRedisAvailable(),
    elasticsearch: isSearchAvailable(),
    mysql: config.authDatabase !== 'mysql' || Boolean(require('./db/mysql').getMySqlPool()),
  };
  const healthy = Object.values(dependencies).every(Boolean);
  res.status(healthy ? 200 : 503).json({ success: healthy, dependencies });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
