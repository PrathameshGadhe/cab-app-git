import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DriverSalaryManagement from './components/DriverSalaryManagement';
import LandingPage from './pages/LandingPage';
import Booking from './pages/Booking';
import CompanyDashboard from './pages/CompanyDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/LoginRegister';
import Login from './pages/Login';
import Admin from './pages/Admin';
import DriverDashboard from './pages/DriverDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import Profile from './pages/Profile';
import RideHistory from './pages/RideHistory';
import AdminLogin from './pages/AdminLogin';
import Invoices from './pages/billing/Invoices';
import React, { useState } from 'react';

function AdminRouteWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <Admin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <LandingPage />
          </motion.div>
        } />
        <Route path="/booking" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          </motion.div>
        } />
        <Route path="/company-dashboard" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <Login />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <Register />
          </motion.div>
        } />
        <Route path="/admin" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute requiredRole="admin">
              <AdminRouteWrapper />
            </ProtectedRoute>
          </motion.div>
        }>
          <Route index element={null} />
          
          {/* Companies Routes */}
          <Route path="companies/register-company" element={
            <div className="admin-content">
              {/* Register Company Component */}
            </div>
          } />
          <Route path="companies/registered-companies" element={
            <div className="admin-content">
              {/* Registered Companies Component */}
            </div>
          } />
          
          {/* Drivers Routes */}
          <Route path="drivers/add-driver" element={
            <div className="admin-content">
              {/* Add Driver Component */}
            </div>
          } />
          <Route path="drivers/manage-drivers" element={
            <div className="admin-content">
              {/* Manage Drivers Component */}
            </div>
          } />
          <Route path="drivers/salary-management" element={
            <div className="admin-content">
              <DriverSalaryManagement />
            </div>
          } />
          
          {/* Bookings Route */}
          <Route path="bookings" element={
            <div className="admin-content">
              {/* Bookings Component */}
            </div>
          } />
          
          {/* Billing Routes */}
          <Route path="billing/booking-invoice" element={
            <div className="admin-content">
              <Invoices type="booking" />
            </div>
          } />
          <Route path="billing/monthly-invoice" element={
            <div className="admin-content">
              <Invoices type="monthly" />
            </div>
          } />
          <Route path="billing/company-invoice" element={
            <div className="admin-content">
              <Invoices type="company" />
            </div>
          } />
          
          {/* Pricing Route */}
          <Route path="pricing" element={
            <div className="admin-content">
              {/* Pricing Component */}
            </div>
          } />
        </Route>
        <Route path="/admin/login" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <AdminLogin />
          </motion.div>
        } />
        <Route path="/driver-dashboard" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute requiredRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </motion.div>
        } />
        <Route path="/history" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <ProtectedRoute>
              <RideHistory />
            </ProtectedRoute>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
