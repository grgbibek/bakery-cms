import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services';
import AdminLayout from './admin/AdminLayout';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminContent from './admin/AdminContent';
import AdminCategories from './admin/AdminCategories';
import AdminLogin from './admin/AdminLogin';
import TrackOrder from './pages/TrackOrder';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="content" element={<AdminContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
