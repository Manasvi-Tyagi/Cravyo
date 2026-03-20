import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserRegister from '../pages/auth/UserRegister.jsx'
import UserLogin from '../pages/auth/UserLogin.jsx'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister.jsx'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin.jsx'
import Home from '../pages/general/home.jsx'
import CreateFood from '../pages/food-partner/CreateFood.jsx'
import Profile from '../pages/food-partner/Profile.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/food-partner/:id" element={<Profile />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
      <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
      <Route path="/create-food" element={<CreateFood />} />
    </Routes>
  )
}

export default AppRoutes