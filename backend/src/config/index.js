const required = (name) => {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env variable: ${name}`);
  return val;
};

const optional = (name, defaultValue = "") => process.env[name] || defaultValue;

const config = {
  port: optional("PORT", "1234"),
  nodeEnv: optional("NODE_ENV", "development"),

  mongoUri: required("MONGO_URI"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiry: optional("JWT_ACCESS_EXPIRY", "15m"),
  jwtRefreshExpiry: optional("JWT_REFRESH_EXPIRY", "7d"),

  imagekitPublicKey: required("IMAGEKIT_PUBLIC_KEY"),
  imagekitPrivateKey: required("IMAGEKIT_PRIVATE_KEY"),
  imagekitUrlEndpoint: required("IMAGEKIT_URL_ENDPOINT"),

  frontendUrl: optional("FRONTEND_URL", "http://localhost:5173"),

  redisUrl: optional("REDIS_URL"),
  cacheTtlSeconds: Number(optional("CACHE_TTL_SECONDS", "300")),
  elasticsearchNode: optional("ELASTICSEARCH_NODE"),
  elasticsearchApiKey: optional("ELASTICSEARCH_API_KEY"),
  elasticsearchIndex: optional("ELASTICSEARCH_INDEX", "cravyo-products"),
  syncCron: optional("SYNC_CRON", "*/5 * * * *"),
  infrastructureRequired: optional("INFRASTRUCTURE_REQUIRED", "false").toLowerCase() === "true",

  // MongoDB remains the default. Set AUTH_DATABASE=mysql to use SQL credentials
  // while retaining MongoDB mirror records for domain relationships.
  authDatabase: optional("AUTH_DATABASE", "mongodb").toLowerCase(),
  mysql: {
    host: optional("MYSQL_HOST"),
    port: Number(optional("MYSQL_PORT", "3306")),
    user: optional("MYSQL_USER"),
    password: optional("MYSQL_PASSWORD"),
    database: optional("MYSQL_DATABASE"),
    connectionLimit: Number(optional("MYSQL_CONNECTION_LIMIT", "10")),
    ssl: optional("MYSQL_SSL", "false").toLowerCase() === "true",
    sslRejectUnauthorized: optional("MYSQL_SSL_REJECT_UNAUTHORIZED", "true").toLowerCase() === "true",
  },
};

if (!['mongodb', 'mysql'].includes(config.authDatabase)) {
  throw new Error('AUTH_DATABASE must be either mongodb or mysql');
}

if (config.authDatabase === 'mysql') {
  for (const key of ['host', 'user', 'database']) {
    if (!config.mysql[key]) {
      throw new Error(`Missing required MySQL configuration: ${key}`);
    }
  }
}

if (config.infrastructureRequired && (!config.redisUrl || !config.elasticsearchNode)) {
  throw new Error('REDIS_URL and ELASTICSEARCH_NODE are required when INFRASTRUCTURE_REQUIRED=true');
}

module.exports = config;
