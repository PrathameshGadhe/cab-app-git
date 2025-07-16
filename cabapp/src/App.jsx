import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Booking from './pages/Booking';
import CompanyDashboard from './pages/CompanyDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/company-dashboard" element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
