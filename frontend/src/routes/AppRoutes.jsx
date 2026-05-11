import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/general/Home';
import Saved from '../pages/general/Saved';
import Following from '../pages/general/Following';
import BottomNav from '../components/BottomNav';
import CreateFood from '../pages/food-partner/CreateFood';
import Profile from '../pages/food-partner/Profile';
import UpdateProfile from '../pages/food-partner/UpdateProfile';
import Followers from '../pages/food-partner/Followers';
import ManageFood from '../pages/food-partner/ManageFood';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ChooseRegister />} />
                <Route path="/register" element={<ChooseRegister />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
                <Route path="/home" element={<ProtectedRoute><><Home /><BottomNav /></></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><><Saved /><BottomNav /></></ProtectedRoute>} />
                <Route path="/following" element={<ProtectedRoute><><Following /><BottomNav /></></ProtectedRoute>} />
                <Route path="/create-food" element={<ProtectedRoute><CreateFood /></ProtectedRoute>} />
                <Route path="/update-profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
                <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
                <Route path="/manage-food" element={<ProtectedRoute><ManageFood /></ProtectedRoute>} />
                <Route path="/food-partner/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </Router>
    )
}

export default AppRoutes
