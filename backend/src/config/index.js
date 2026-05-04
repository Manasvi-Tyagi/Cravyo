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
};

module.exports = config;
