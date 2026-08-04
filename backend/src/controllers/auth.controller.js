const UserModel = require('../models/user.model');
const MerchantModel = require('../models/merchant.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const AccountService = require('../services/account.service');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',   // 'strict' blocks cross-port localhost (5173→1234)
};

function issueTokens(payload) {
  const accessToken = jwt.sign(payload, config.jwtAccessSecret, { expiresIn: config.jwtAccessExpiry });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry });
  return { accessToken, refreshToken };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
  // Legacy cookie kept for backward compat with old frontend code
  res.cookie('token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
}

// ── CUSTOMER ──────────────────────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");

  if (await AccountService.findByEmail('customer', email)) throw new ApiError(409, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await AccountService.create('customer', { name, email, password: hashedPassword });

  const { accessToken, refreshToken } = issueTokens({ id: user._id, role: 'customer' });
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(new ApiResponse(201, { id: user._id, name: user.name, email: user.email }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const account = await AccountService.findByEmail('customer', email);
  if (!account) throw new ApiError(401, "Invalid email or password");
  const { mongoAccount: user, password: passwordHash } = await AccountService.credentialsFor(account);
  if (!(await bcrypt.compare(password, passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = issueTokens({ id: user._id, role: 'customer' });
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(new ApiResponse(200, { id: user._id, name: user.name, email: user.email }, "Logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('token');
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.customer;
  if (!user) throw new ApiError(401, "Not authenticated");
  res.status(200).json(new ApiResponse(200, { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage }));
});

// ── MERCHANT ──────────────────────────────────────────────────────────────────

const registerMerchant = asyncHandler(async (req, res) => {
  const { name, restaurantName, phone, address, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");

  if (await AccountService.findByEmail('merchant', email)) throw new ApiError(409, "Merchant already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const merchant = await AccountService.create('merchant', { name, restaurantName, phone, address, email, password: hashedPassword });

  const { accessToken, refreshToken } = issueTokens({ id: merchant._id, role: 'merchant' });
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(new ApiResponse(201, { id: merchant._id, name: merchant.name, email: merchant.email }, "Merchant registered successfully"));
});

const loginMerchant = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const account = await AccountService.findByEmail('merchant', email);
  if (!account) throw new ApiError(401, "Invalid email or password");
  const { mongoAccount: merchant, password: passwordHash } = await AccountService.credentialsFor(account);
  if (!(await bcrypt.compare(password, passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = issueTokens({ id: merchant._id, role: 'merchant' });
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(new ApiResponse(200, { id: merchant._id, name: merchant.name, email: merchant.email, restaurantName: merchant.restaurantName }, "Logged in successfully"));
});

const logoutMerchant = asyncHandler(async (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('token');
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

const getCurrentMerchant = asyncHandler(async (req, res) => {
  const merchant = req.merchant;
  if (!merchant) throw new ApiError(401, "Not authenticated");
  res.status(200).json(new ApiResponse(200, { id: merchant._id, name: merchant.name, email: merchant.email, restaurantName: merchant.restaurantName, image: merchant.image }));
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefresh = req.cookies.refresh_token;
  if (!incomingRefresh) throw new ApiError(401, "No refresh token");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefresh, config.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const { accessToken, refreshToken } = issueTokens({ id: decoded.id, role: decoded.role });
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json(new ApiResponse(200, null, "Token refreshed"));
});

// ── BACKWARD COMPAT ALIASES ───────────────────────────────────────────────────
const registerFoodPartner = registerMerchant;
const loginFoodPartner = loginMerchant;
const logoutFoodPartner = logoutMerchant;
const getCurrentFoodPartner = getCurrentMerchant;

module.exports = {
  registerUser, loginUser, logoutUser, getCurrentUser,
  registerMerchant, loginMerchant, logoutMerchant, getCurrentMerchant,
  registerFoodPartner, loginFoodPartner, logoutFoodPartner, getCurrentFoodPartner,
  refreshAccessToken,
};
