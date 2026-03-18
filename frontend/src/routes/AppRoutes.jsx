import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserRegister from '../pages/UserRegister.jsx'
import UserLogin from '../pages/UserLogin.jsx'
import FoodPartnerRegister from '../pages/FoodPartnerRegister.jsx'
import FoodPartnerLogin from '../pages/FoodPartnerLogin.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/user/register" />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
      <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
      <Route path="*" element={<Navigate replace to="/user/register" />} />
    </Routes>
  )
}

export default AppRoutes