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
    if (decoded.role !== 'merchant') return res.status(403).json({ message: "Merchant login required" });
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
    if (decoded.role !== 'customer') return res.status(403).json({ message: "Customer login required" });
    const customer = await userModel.findById(decoded.id).select('-password');
    if (!customer) return res.status(401).json({ message: "Customer not found" });
    req.customer = customer;
    req.user = customer; // backward compat
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function authCustomerOrMerchantMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized: please login first" });
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    if (decoded.role === 'customer') {
      const customer = await userModel.findById(decoded.id).select('-password');
      if (!customer) return res.status(401).json({ message: "Customer not found" });
      req.customer = customer;
      req.user = customer;
      req.authActor = { id: customer._id.toString(), type: 'customer', account: customer };
      return next();
    }
    if (decoded.role === 'merchant') {
      const merchant = await MerchantModel.findById(decoded.id).select('-password -refreshToken');
      if (!merchant) return res.status(401).json({ message: "Merchant not found" });
      req.merchant = merchant;
      req.authActor = { id: merchant._id.toString(), type: 'merchant', account: merchant };
      return next();
    }
    return res.status(403).json({ message: "Unsupported account role" });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function optionalAuthActorMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    const Model = decoded.role === 'merchant' ? MerchantModel : userModel;
    const account = await Model.findById(decoded.id).select('-password -refreshToken');
    if (account) {
      if (decoded.role === 'merchant') req.merchant = account;
      else { req.customer = account; req.user = account; }
      req.authActor = { id: account._id.toString(), type: decoded.role, account };
    }
  } catch {
    // Public endpoints remain accessible when an optional token is stale.
  }
  next();
}

// Backward-compat alias
const authFoodPartnerMiddleware = authMerchantMiddleware;

module.exports = { authMerchantMiddleware, authFoodPartnerMiddleware, authCustomerMiddleware, authCustomerOrMerchantMiddleware, optionalAuthActorMiddleware };
