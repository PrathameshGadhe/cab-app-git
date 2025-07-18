import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Booking from './pages/Booking';
import CompanyDashboard from './pages/CompanyDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/LoginRegister';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import Profile from './pages/Profile';
import RideHistory from './pages/RideHistory';
import AdminLogin from './pages/AdminLogin';

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
              <Admin />
            </ProtectedRoute>
          </motion.div>
        } />
        <Route path="/admin/login" element={
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <AdminLogin />
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
