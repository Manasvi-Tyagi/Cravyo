const cartModel = require('../models/cart.model');
const foodModel = require('../models/food.model');

async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const { foodId, quantity } = req.body;

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = await cartModel.create({
                userId,
                items: [],
                totalAmount: 0
            });
        }

        const existingItem = cart.items.find(
            item => item.foodId.toString() === foodId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                foodId,
                name: food.name,
                price: food.price,
                image: food.image,
                quantity
            });
        }

        // recalc total
        let total = 0;
        cart.items.forEach(item => {
            total += item.price * item.quantity;
        });

        cart.totalAmount = total;

        await cart.save();

        res.status(200).json({
            message: "Item added to cart",
            cart
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


async function getCart(req, res) {
    try {
        const userId = req.user.id;

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                cart: { items: [], totalAmount: 0 }
            });
        }

        res.status(200).json({
            message: "Cart fetched successfully",
            cart
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


async function removeFromCart(req, res) {
    try {
        const userId = req.user.id;
        const foodId = req.params.foodId;

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            item => item.foodId.toString() !== foodId
        );

        let total = 0;
        cart.items.forEach(item => {
            total += item.price * item.quantity;
        });

        cart.totalAmount = total;

        await cart.save();

        res.status(200).json({
            message: "Item removed from cart",
            cart
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


async function updateCartItem(req, res) {
    try {
        const userId = req.user.id;
        const { foodId, quantity } = req.body;

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(
            item => item.foodId.toString() === foodId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not in cart" });
        }

        item.quantity = quantity;

        let total = 0;
        cart.items.forEach(item => {
            total += item.price * item.quantity;
        });

        cart.totalAmount = total;

        await cart.save();

        res.status(200).json({
            message: "Cart updated successfully",
            cart
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem
};