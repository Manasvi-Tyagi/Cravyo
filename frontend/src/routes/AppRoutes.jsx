import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserRegister from '../pages/auth/UserRegister.jsx'
import UserLogin from '../pages/auth/UserLogin.jsx'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister.jsx'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin.jsx'
import Home from '../pages/general/home.jsx'
import Saved from '../pages/general/Saved.jsx'
import Cart from '../pages/general/Cart.jsx'
import Orders from '../pages/general/Orders.jsx'
import CreateFood from '../pages/food-partner/CreateFood.jsx'
import FoodPartnerHome from '../pages/food-partner/FoodPartnerHome.jsx'
import Profile from '../pages/food-partner/Profile.jsx'
import MerchantOrders from '../pages/merchant/MerchantOrders.jsx'

function AppRoutes() {
  return (
    <Routes>
      {/* Customer routes */}
      <Route path="/" element={<Home />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />

      {/* Auth routes */}
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
      <Route path="/food-partner/login" element={<FoodPartnerLogin />} />

      {/* Public: merchant store page (accessible to all users) */}
      <Route path="/store/:id" element={<Profile />} />

      {/* Merchant routes */}
      <Route path="/food-partner/home" element={<FoodPartnerHome />} />
      <Route path="/food-partner/:id" element={<Profile />} />
      <Route path="/create-food" element={<CreateFood />} />
      <Route path="/merchant/orders" element={<MerchantOrders />} />
    </Routes>
  )
}

export default AppRoutes