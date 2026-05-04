const MerchantModel = require('../models/merchant.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');

function getToken(req) {
  // Prefer new access_token cookie, fall back to legacy token cookie
  return req.cookies.access_token || req.cookies.token;
}

async function authMerchantMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized: please login first" });
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    const merchant = await MerchantModel.findById(decoded.id).select('-password -refreshToken');
    if (!merchant) return res.status(401).json({ message: "Merchant not found" });
    req.merchant = merchant;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function authCustomerMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized: please login first" });
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    const customer = await userModel.findById(decoded.id).select('-password');
    if (!customer) return res.status(401).json({ message: "Customer not found" });
    req.customer = customer;
    req.user = customer; // backward compat
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Backward-compat alias
const authFoodPartnerMiddleware = authMerchantMiddleware;

module.exports = { authMerchantMiddleware, authFoodPartnerMiddleware, authCustomerMiddleware };