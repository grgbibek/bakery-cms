import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

// ─── Lazy-loaded public pages ─────────────────────────────────────────────────
const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Services      = lazy(() => import('./pages/Services'));
const TrackOrder    = lazy(() => import('./pages/TrackOrder'));

// ─── Lazy-loaded rider pages ──────────────────────────────────────────────────
const RiderLogin       = lazy(() => import('./pages/RiderLogin'));
const RiderPanel       = lazy(() => import('./pages/RiderPanel'));
const RiderOrderDetail = lazy(() => import('./pages/RiderOrderDetail'));

// ─── Lazy-loaded admin pages ──────────────────────────────────────────────────
const AdminLogin       = lazy(() => import('./admin/AdminLogin'));
const AdminLayout      = lazy(() => import('./admin/AdminLayout'));
const AdminOrders      = lazy(() => import('./admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./admin/AdminOrderDetail'));
const AdminProducts    = lazy(() => import('./admin/AdminProducts'));
const AdminCategories  = lazy(() => import('./admin/AdminCategories'));
const AdminUsers       = lazy(() => import('./admin/AdminUsers'));
const AdminReports     = lazy(() => import('./admin/AdminReports'));
const AdminSettings    = lazy(() => import('./admin/AdminSettings'));
const AdminContent     = lazy(() => import('./admin/AdminContent'));

// ─── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#faf9f7',
    flexDirection: 'column',
    gap: '1.5rem',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: '3px solid #f0e6d6',
      borderTop: '3px solid var(--primary, #c38452)',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p style={{ color: '#999', fontSize: '0.95rem', margin: 0 }}>Loading…</p>
  </div>
);

// ─── Route guards ─────────────────────────────────────────────────────────────
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

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <CartDrawer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<Home />} />
            <Route path="/products"      element={<Products />} />
            <Route path="/product/:id"   element={<ProductDetail />} />
            <Route path="/services"      element={<Services />} />
            <Route path="/track-order"   element={<TrackOrder />} />

            {/* Rider */}
            <Route path="/rider/login" element={<RiderLogin />} />
            <Route path="/rider" element={
              <RiderProtectedRoute><RiderPanel /></RiderProtectedRoute>
            } />
            <Route path="/rider/order/:id" element={
              <RiderProtectedRoute><RiderOrderDetail /></RiderProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute><AdminLayout /></ProtectedRoute>
            }>
              <Route index                element={<AdminOrders />} />
              <Route path="products"      element={<AdminProducts />} />
              <Route path="orders/:id"    element={<AdminOrderDetail />} />
              <Route path="reports"       element={<AdminReports />} />
              <Route path="categories"    element={<AdminCategories />} />
              <Route path="users"         element={<AdminOnlyRoute><AdminUsers /></AdminOnlyRoute>} />
              <Route path="settings"      element={<AdminOnlyRoute><AdminSettings /></AdminOnlyRoute>} />
              <Route path="content"       element={<AdminOnlyRoute><AdminContent /></AdminOnlyRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
