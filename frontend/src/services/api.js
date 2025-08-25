import axios from 'axios';

// Get API URL from Vite environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set up axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific status codes
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      console.error('Authentication error, redirecting to login');
      // You might want to redirect to login here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Driver Salary & Advance APIs
export const driverApi = {
  // Set/Update driver's base salary for current cycle
  setSalary: (driverId, data) => api.put(`/drivers/${driverId}/salary`, data),
  
  // Adjust salary (increase/decrease)
  adjustSalary: (driverId, data) => api.put(`/drivers/${driverId}/salary/adjust`, data),
  
  // Give advance payment for current cycle
  giveAdvance: (driverId, data) => api.post(`/drivers/${driverId}/advance`, data),
  
  // Get salary status and current cycle information
  getSalaryStatus: (driverId) => api.get(`/drivers/${driverId}/salary/status`),
  
  // Get driver report (full details including history)
  getDriverReport: (driverId) => api.get(`/drivers/${driverId}/report`),
  
  // Get all drivers
  getAllDrivers: () => api.get('/drivers'),
  
  // Get single driver
  getDriver: (driverId) => api.get(`/drivers/${driverId}`),
  
  // Helper function to format cycle dates for display
  formatCycleDates: (startDate, endDate) => {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  },
  
  // Helper function to format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
};

export default api;
