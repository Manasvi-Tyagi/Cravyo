const MerchantModel = require('../models/merchant.model');
const ProductModel = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getMerchantById = asyncHandler(async (req, res) => {
  const merchant = await MerchantModel.findById(req.params.id).select('-password -refreshToken');
  if (!merchant) throw new ApiError(404, "Merchant not found");

  const products = await ProductModel.find({ merchant: req.params.id }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, {
    merchant: { id: merchant._id, name: merchant.name, restaurantName: merchant.restaurantName, image: merchant.image },
    products,
  }));
});

module.exports = { getMerchantById };
