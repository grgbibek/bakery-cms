import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import AdminLayout from './admin/AdminLayout';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminContent from './admin/AdminContent';
import AdminCategories from './admin/AdminCategories';
import AdminLogin from './admin/AdminLogin';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AdminSettings from './admin/AdminSettings';
import TrackOrder from './pages/TrackOrder';
import RiderPanel from './pages/RiderPanel';
import RiderOrderDetail from './pages/RiderOrderDetail';
import RiderLogin from './pages/RiderLogin';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

const RiderProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('riderToken');
  if (!token) return <Navigate to="/rider/login" replace />;
  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to="/admin" replace />;
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <CartDrawer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider" element={
            <RiderProtectedRoute>
              <RiderPanel />
            </RiderProtectedRoute>
          } />
          <Route path="/rider/order/:id" element={
            <RiderProtectedRoute>
              <RiderOrderDetail />
            </RiderProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="users" element={
              <AdminOnlyRoute>
                <AdminUsers />
              </AdminOnlyRoute>
            } />
            <Route path="reports" element={<AdminReports />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={
              <AdminOnlyRoute>
                <AdminSettings />
              </AdminOnlyRoute>
            } />
            <Route path="content" element={
              <AdminOnlyRoute>
                <AdminContent />
              </AdminOnlyRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
