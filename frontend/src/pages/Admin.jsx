import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Admin.css';
import { FaUserPlus, FaEdit, FaTrash, FaBars, FaUpload, FaCheckCircle, FaTimesCircle, FaCar, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DriverSalaryManagement from '../components/DriverSalaryManagement';
import { toast } from 'react-hot-toast';



const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { 
    key: 'companies', 
    label: 'Companies', 
    icon: '🏢',
    submenu: [
      { key: 'register-company', label: 'Register Company' },
      { key: 'registered-companies', label: 'Registered Companies' }
    ]
  },
  { 
    key: 'drivers', 
    label: 'Drivers', 
    icon: '🚖',
    submenu: [
      { key: 'add-driver', label: 'Add Driver' },
      { key: 'manage-drivers', label: 'Manage Drivers' },
      { key: 'salary-management', label: 'Salary Management' }
    ]
  },
  { key: 'bookings', label: 'Bookings', icon: '🚕' },
  { 
    key: 'billing', 
    label: 'Billing & Revenue', 
    icon: '💰',
    submenu: [
      { key: 'booking-invoice', label: 'Booking Invoice' },
      { key: 'monthly-invoice', label: 'Monthly Invoice' },
      { key: 'company-invoice', label: 'Company Invoice' }
    ]
  },
  { key: 'pricing', label: 'Pricing & Add-ons', icon: '⚙️' },
];

const Admin = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState('dashboard');
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Update active state based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/billing/')) {
      setActive('billing');
      setSidebarOpen(false);
    }
  }, [location]);
  
  // Render the main content based on active tab
  const renderMainContent = () => {
    // If we're on a billing route, let the Outlet handle the rendering
    if (location.pathname.startsWith('/admin/billing/')) {
      return <Outlet />;
    }
    
    // Default dashboard view
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((module) => (
            <div
              key={module.key}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleNavClick(module.key)}
            >
              <div className="text-4xl mb-4">{module.icon}</div>
              <h2 className="text-xl font-semibold">{module.label}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [activeSubmenu, setActiveSubmenu] = useState('register-company');
  const [activeDriverSubmenu, setActiveDriverSubmenu] = useState('manage-drivers');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Driver details state
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverReport, setDriverReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Driver assignment state
  const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState('');
  const [selectedDriverForSalary, setSelectedDriverForSalary] = useState('');


  
  
  // Company selection state
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Driver assignment states
  const [showDriverAssignment, setShowDriverAssignment] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  
  // Vehicle assignment states
  const [showVehicleAssignment, setShowVehicleAssignment] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isAssigningVehicle, setIsAssigningVehicle] = useState(false);
  const [vehicleAssignmentError, setVehicleAssignmentError] = useState('');

  // Companies
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ companyName: '', companyId: '', email: '', password: '' });

  // Driver form state
  const [newDriver, setNewDriver] = useState({ 
    fullName: '', 
    phoneNumber: '', 
    email: '', 
    gender: 'Male',
    licenseImage: null,
    aadhaarCardImage: null,
    salary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  // Add this new function to fetch available drivers
  const fetchAvailableDrivers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/driver', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      
      const data = await response.json();
      setAvailableDrivers(data.drivers || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers');
      toast.error('Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle driver assignment to booking
  const handleAssignDriver = async () => {
    if (!selectedDriverForAssignment || !selectedBookingId) {
      toast.error('Please select a driver');
      return;
    }

    setIsAssigning(true);
    setAssignmentError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/bookings/assignDriver', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          driverId: selectedDriverForAssignment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Error response:', data);
        throw new Error(data.message || `Failed to assign driver: ${response.statusText}`);
      }

      // Success - update UI
      const assignedDriver = availableDrivers.find(d => d._id === selectedDriverForAssignment);
      toast.success(`✅ Driver ${assignedDriver?.fullName || ''} has been successfully assigned to the booking!`, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#4CAF50',
          color: 'white',
          fontWeight: 'bold',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      });
      setShowDriverAssignment(false);
      setSelectedDriverForAssignment('');
      setSelectedBookingId(null);
    } catch (error) {
      console.error('Error assigning driver:', error);
      setAssignmentError(error.message || 'Failed to assign driver. Please try again.');
      toast.error('Failed to assign driver');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle accepting a booking (for drivers)
  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/acceptBooking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          driverId: 'current_driver_id' // You'll need to get the current driver's ID from your auth context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept booking');
      }

      // Update the booking status in the UI
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'accepted' }
            : booking
        )
      );

      toast.success('Booking accepted successfully!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(error.message || 'Failed to accept booking');
    }
  };
  
  // Handle assign driver click
  const handleAssignClick = async (bookingId) => {
    console.log('Assign button clicked, bookingId:', bookingId);
    
    // First, set the selected booking ID and show the modal
    setSelectedBookingId(bookingId);
    setShowDriverAssignment(true);
    
    try {
      console.log('Fetching available drivers...');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/driver/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available drivers');
      }
      
      const data = await response.json();
      console.log('Fetched available drivers:', data);
      setAvailableDrivers(Array.isArray(data) ? data : (data.drivers || []));
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      toast.error('Failed to load available drivers');
    }
  };
  
  //////////////////////////////////////////////////////////////////////////////////////
  // Handle assign vehicle click
  const handleAssignVehicleClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowVehicleAssignment(true);
  };
  
  // Handle vehicle assignment submission
  const handleAssignVehicle = async () => {
    if (!vehicleNumber.trim()) {
      setVehicleAssignmentError('Please enter a vehicle number');
      return;
    }
    
    setIsAssigningVehicle(true);
    setVehicleAssignmentError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${selectedBookingId}/assign-vehicle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicleNumber })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign vehicle');
      }
      
      // Update the bookings list with the assigned vehicle
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBookingId 
            ? { ...booking, vehicleNumber: vehicleNumber.trim().toUpperCase() } 
            : booking
        )
      );
      
      toast.success('Vehicle assigned successfully');
      setShowVehicleAssignment(false);
      setVehicleNumber('');
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      setVehicleAssignmentError(error.message || 'Failed to assign vehicle');
    } finally {
      setIsAssigningVehicle(false);
    }
  };

  // Handle edit driver
  const handleEditDriver = (driver) => {
    setNewDriver({
      ...driver,
      isEditing: true,
      driverId: driver._id
    });
    setActiveDriverSubmenu('add-driver');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch driver report data
  const fetchDriverReport = async (driverId) => {
    // Only proceed if we're on the salary management page
    if (activeDriverSubmenu !== 'salary-management') {
      console.log('Skipping driver report fetch - not on salary management page');
      return;
    }
    
    console.log('=== fetchDriverReport called for salary management ===');
    console.log('Driver ID:', driverId);
    try {
      setIsLoadingReport(true);
      const token = localStorage.getItem('token');
      console.log('Fetching driver report for:', driverId);
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch(`http://localhost:5000/api/driver/${driverId}/report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for cookies if using them
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Driver report data:', data);
      setDriverReport(data);
      setSelectedDriver(driverId);
      setSelectedDriverForSalary(driverId);
    } catch (err) {
      console.error('=== Error in fetchDriverReport ===');
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        driverId,
        activeDriverSubmenu,
        selectedDriverForSalary
      });
      
      // Only show error if we're actually on the salary management page
      if (activeDriverSubmenu === 'salary-management') {
        toast.error(`Failed to load driver details: ${err.message}`);
      } else {
        console.log('Suppressing error toast as we\'re not on salary management page');
      }
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Handle delete driver
  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/driver/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }

      // Refresh the drivers list
      setDrivers(drivers.filter(driver => driver._id !== driverId));
      toast.success('Driver deleted successfully');
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error('Failed to delete driver');
    }
  };

  // Fetch drivers when manage-drivers tab is active
  useEffect(() => {
    const fetchDrivers = async () => {
      if (activeDriverSubmenu === 'manage-drivers') {
        setIsLoading(true);
        setError('');
     
       try {
          const token = localStorage.getItem('token');
          console.log('Fetching drivers with token:', token ? 'Token exists' : 'No token found');
          
          const response = await fetch('http://localhost:5000/api/driver', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          console.log('Drivers response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error response:', errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Drivers data:', data);
          setDrivers(data);
        } catch (err) {
          console.error('Error fetching drivers:', err);
          setError(`Failed to load drivers: ${err.message}`);
          toast.error(`Failed to load drivers: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDrivers();
  }, [activeDriverSubmenu]);

  const resetForm = () => {
    setNewDriver({ 
      fullName: '', 
      phoneNumber: '', 
      email: '', 
      gender: 'Male',
      licenseImage: null,
      aadhaarCardImage: null
    });
    setSubmitStatus({ success: null, message: '' });
    setShowSuccess(false);
  };



  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  const handleNavClick = (key, e) => {
    // Prevent default link behavior if event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // If clicking the same menu, just toggle the submenu
    if (active === key) {
      setExpandedMenu(expandedMenu === key ? null : key);
      setSidebarOpen(false);
      return;
    }
    
    setActive(key);
    
    switch(key) {
      case 'billing':
        // Toggle the billing submenu and navigate to the first submenu item
        setExpandedMenu(expandedMenu === 'billing' ? null : 'billing');
        if (expandedMenu !== 'billing') {
          // Default to booking-invoice when opening the billing menu
          setActiveSubmenu('booking-invoice');
          navigate('/admin/billing/booking-invoice');
        }
        break;
      case 'companies':
        // Toggle submenu visibility for companies
        setExpandedMenu(expandedMenu === 'companies' ? null : 'companies');
        if (expandedMenu !== 'companies') {
          setActiveSubmenu('register-company'); // Default to register company when opening
        }
        break;
      case 'drivers':
        // Toggle submenu visibility for drivers
        setExpandedMenu(expandedMenu === 'drivers' ? null : 'drivers');
        if (expandedMenu !== 'drivers') {
          setActiveDriverSubmenu('add-driver'); // Default to add driver when opening
        }
        break;
      default:
        // For other menu items, close any open submenus
        setExpandedMenu(null);
        // Navigate to the root of the section
        navigate(`/admin/${key === 'dashboard' ? '' : key}`);
    }
    
    // Only close sidebar if we're not on mobile or if we're not opening a submenu
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

// ...
  const handleSubmenuClick = (submenuKey, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Handle company submenus
    if (submenuKey === 'register-company' || submenuKey === 'registered-companies') {
      setActive('companies');
      setActiveSubmenu(submenuKey);
      setExpandedMenu('companies');
      navigate(`/admin/companies/${submenuKey}`);
    } 
    // Handle driver submenus
    else if (submenuKey === 'add-driver' || submenuKey === 'manage-drivers' || submenuKey === 'salary-management') {
      setActive('drivers');
      setActiveDriverSubmenu(submenuKey);
      setExpandedMenu('drivers');
      navigate(`/admin/drivers/${submenuKey}`);
    } 
    // Handle billing submenus
    else if (['booking-invoice', 'monthly-invoice', 'company-invoice'].includes(submenuKey)) {
      setActive('billing');
      setActiveSubmenu(submenuKey);
      setExpandedMenu('billing');
      
      // Navigate to the corresponding billing route
      navigate(`/admin/billing/${submenuKey}`);
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCompanyInput = (e) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleDriverInput = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setNewDriver(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleCompanyRegister = async (e) => {
    e.preventDefault();
    if (!newCompany.companyName || !newCompany.companyId || !newCompany.email || !newCompany.password) return;
    try {
      const response = await fetch('http://localhost:5000/api/company/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });
      const data = await response.json();
      if (response.ok) {
        setCompanies((prev) => [...prev, { id: prev.length + 1, name: newCompany.companyName, email: newCompany.email, status: 'Active' }]);
        alert('Company registered successfully!');
        setNewCompany({ companyName: '', companyId: '', email: '', password: '' });
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error registering company:', error);
      alert('❌ Server error. Try again later.');
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditing = !!newDriver.isEditing;
    const loadingMessage = isEditing ? 'Updating driver...' : 'Registering driver...';
    const successMessage = isEditing ? 'Driver updated successfully' : 'Driver registered successfully';
    const errorMessage = isEditing ? 'Failed to update driver' : 'Failed to register driver';
    
    const loadingToast = toast.loading(loadingMessage);

    // Basic validation
    if (!newDriver.fullName || !newDriver.phoneNumber || !newDriver.email) {
      toast.dismiss(loadingToast);
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // For new drivers, validate files are uploaded
    if (!isEditing && (!newDriver.licenseImage || !newDriver.aadhaarCardImage)) {
      toast.dismiss(loadingToast);
      toast.error('Please upload both license and Aadhaar card images');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Append all driver data except files and internal fields
      Object.keys(newDriver).forEach(key => {
        if (key !== 'licenseImage' && key !== 'aadhaarCardImage' && key !== 'isEditing' && key !== 'driverId' && key !== '_id') {
          formData.append(key, newDriver[key]);
        }
      });
      
      // Append files if they exist and are File objects
      if (newDriver.licenseImage instanceof File) {
        formData.append('licenseImage', newDriver.licenseImage);
      }
      
      if (newDriver.aadhaarCardImage instanceof File) {
        formData.append('aadhaarCardImage', newDriver.aadhaarCardImage);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Determine the API endpoint and method based on whether we're creating or updating
      const url = isEditing 
        ? `http://localhost:5000/api/driver/${newDriver.driverId}`
        : 'http://localhost:5000/api/driver/register';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - let the browser set it with the correct boundary
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(successMessage);
        
        // Reset form
        setNewDriver({
          fullName: '', 
          phoneNumber: '', 
          email: '', 
          gender: 'Male',
          vehicleNumber: '',
          vehicleType: 'Sedan',
          licenseImage: null,
          aadhaarCardImage: null,
          isEditing: false,
          driverId: null,
          _id: null
        });
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          input.value = '';
        });
        
        // Refresh drivers list
        setActiveDriverSubmenu('manage-drivers');
      } else {
        throw new Error(data.message || 'Failed to process request');
      }
      setSubmitStatus({ success: true, message: 'Driver registered successfully!' });
      setShowSuccess(true);
      
      // Reset form but keep the success message visible
      setNewDriver({
        fullName: '',
        phoneNumber: '',
        email: '',
        gender: 'Male',
        vehicleNumber: '',
        vehicleType: 'Sedan',
        licenseImage: null,
        aadhaarCardImage: null
      });
      
      toast.success('Driver registered successfully!');
      
    } catch (error) {
      console.error('Error registering driver:', error);
      setIsSubmitting(false);
      toast.error(error.message || 'Failed to register driver. Please try again.', {
        icon: <FaTimesCircle className="text-red-500" />,
        duration: 5000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleRemoveDriver = (id) => {
    setDrivers((prev) => prev.filter(d => d.id !== id));
  };



  React.useEffect(() => {
    if (active === 'bookings') {
      setBookingsLoading(true);
      const token = localStorage.getItem('token');
      
      fetch('http://localhost:5000/api/bookings/allBookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch bookings');
          }
          return res.json();
        })
        .then(data => {
          // Handle both formats: { bookings: [...] } or direct array
          const bookingsData = Array.isArray(data) ? data : (data.bookings || []);
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          setBookingsError('');
        })
        .catch((err) => {
          console.error('Error fetching bookings:', err);
          setBookingsError('Failed to fetch bookings. Please try again.');
          setBookings([]);
        })
        .finally(() => setBookingsLoading(false));
    }
  }, [active]);

  return (
    <>
      <Navbar />
      {/* Sidebar Toggle Button */}
      <button
        className="admin-hamburger admin-sidebar-hamburger"
        style={{ display: 'flex', margin: '16px 0 8px 16px', zIndex: 1101 }}
        onClick={() => setSidebarOpen && setSidebarOpen(true)}
        aria-label="Open sidebar menu"
        type="button"
      >
        <FaBars />
      </button>

      <div className="admin-root-premium">
        {/* Sidebar */}
        <aside className={`admin-sidebar-premium${sidebarOpen ? ' open' : ''}`}>
          <div className="admin-sidebar-title">Super Admin</div>
          <ul className="admin-nav-premium">
            {MODULES.map((module) => (
              <li key={module.key}>
                <button
                  className={`nav-item ${(active === module.key || (module.key === 'companies' && expandedMenu === 'companies') || (module.key === 'drivers' && expandedMenu === 'drivers')) ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(module.key, e)}
                >
                  <span className="admin-nav-icon">{module.icon}</span>
                  {module.label}
                  {module.submenu && (
                    <span className={`submenu-arrow ${expandedMenu === module.key ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  )}
                </button>
                {module.submenu && (
                  <ul className={`admin-submenu ${expandedMenu === module.key ? 'expanded' : ''}`}>
                    {module.submenu.map((submenu) => (
                      <li key={submenu.key}>
                        <button
                          className={`submenu-item ${
                            (module.key === 'companies' && activeSubmenu === submenu.key) || 
                            (module.key === 'drivers' && activeDriverSubmenu === submenu.key) ||
                            (module.key === 'billing' && activeSubmenu === submenu.key) 
                              ? 'active' 
                              : ''
                          }`}
                          onClick={(e) => handleSubmenuClick(submenu.key, e)}
                        >
                          {submenu.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>
        {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <main className="admin-main-premium">
          {/* Render the Outlet for nested routes */}
          <Outlet />
          
          {/* Only show the header and content for non-billing routes */}
          {!location.pathname.startsWith('/admin/billing/') && (
            <>
              <div className="admin-header-bar">
                {active === 'companies' && activeSubmenu ? 
                  `Companies - ${MODULES.find(m => m.key === 'companies')?.submenu?.find(s => s.key === activeSubmenu)?.label}` : 
                  MODULES.find(m => m.key === active)?.label
                }
              </div>

              {/* Dashboard */}
              {active === 'dashboard' && (
                <section>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                    <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: 24, color: '#2b7cff', fontWeight: 600 }}>Total Employees: 150</div>
                    <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: 24, color: '#22c55e', fontWeight: 600 }}>Active Rides: 12</div>
                    <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: 24, color: '#a855f7', fontWeight: 600 }}>Monthly Expenses: ₹2.5L</div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* Companies */}
          {active === 'companies' && (
            <section>
              {/* Register Company Submenu */}
              {activeSubmenu === 'register-company' && (
                <div>
                  <h3>Register New Company</h3>
                  <form className="admin-company-form" onSubmit={handleCompanyRegister} autoComplete="off">
                    <input type="text" name="companyName" placeholder="Company Name" value={newCompany.companyName} onChange={handleCompanyInput} required />
                    <input type="text" name="companyId" placeholder="Company ID" value={newCompany.companyId} onChange={handleCompanyInput} required />
                    <input type="email" name="email" placeholder="Company Email" value={newCompany.email} onChange={handleCompanyInput} required />
                    <input type="password" name="password" placeholder="Password" value={newCompany.password} onChange={handleCompanyInput} required />
                    <button type="submit">Register Company</button>
                  </form>
                </div>
              )}

              {/* Registered Companies Submenu */}
              {activeSubmenu === 'registered-companies' && (
                <div>
                  <h3>Registered Companies</h3>
                  <div className="admin-table-premium">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map(c => (
                          <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Drivers */}
          {active === 'drivers' && (
            <section>
              <h3>Driver Management</h3>

              {/* Add Driver Content */}
              {activeDriverSubmenu === 'add-driver' && (
                <div className="admin-company-form-card">
                  {showSuccess ? (
                    <div className="success-message">
                      <div className="success-icon">
                        <FaCheckCircle />
                      </div>
                      <h3>Driver Registered Successfully!</h3>
                      <p>Your driver has been registered and added to the system.</p>
                      <div className="success-actions">
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={() => setShowSuccess(false)}
                        >
                          Register Another Driver
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setActiveDriverSubmenu('manage-drivers')}
                        >
                          View All Drivers
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="driver-registration-form" onSubmit={handleAddDriver} encType="multipart/form-data">
                      <div className="form-container">
                        <h3 className="form-title">Register New Driver</h3>
                      
                      {/* Personal Information Section */}
                      <div className="form-section">
                        <h4 className="section-title">Personal Information</h4>
                        <div className="form-grid">
                          {/* Full Name */}
                          <div className="form-group">
                            <label>Full Name <span className="required">*</span></label>
                            <div className="input-with-icon">
                              <input 
                                type="text" 
                                name="fullName" 
                                placeholder="John Doe" 
                                value={newDriver.fullName} 
                                onChange={handleDriverInput}
                                className={!newDriver.fullName && submitStatus ? 'error' : ''}
                                required 
                              />
                              <span className="input-icon">👤</span>
                            </div>
                          </div>
                          
                          {/* Email */}
                          <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                              <input 
                                type="email" 
                                name="email" 
                                placeholder="john.doe@example.com" 
                                value={newDriver.email} 
                                onChange={handleDriverInput}
                              />
                              <span className="input-icon">✉️</span>
                            </div>
                          </div>
                          
                          {/* Password */}
                          <div className="form-group">
                            <label>Password <span className="required">*</span></label>
                            <div className="input-with-icon">
                              <input 
                                type="password" 
                                name="password" 
                                placeholder="Create a password" 
                                value={newDriver.password || ''} 
                                onChange={handleDriverInput}
                                className={!newDriver.password && submitStatus ? 'error' : ''}
                                required 
                              />
                              <span className="input-icon">🔒</span>
                            </div>
                          </div>
                          
                          {/* Phone Number */}
                          <div className="form-group">
                            <label>Phone Number <span className="required">*</span></label>
                            <div className="input-with-icon">
                              <input 
                                type="tel" 
                                name="phoneNumber" 
                                placeholder="+91 98765 43210" 
                                value={newDriver.phoneNumber} 
                                onChange={handleDriverInput}
                                className={!newDriver.phoneNumber && submitStatus ? 'error' : ''}
                                required 
                              />
                              <span className="input-icon">📱</span>
                            </div>
                          </div>
                          
                          {/* Gender */}
                          <div className="form-group">
                            <label>Gender <span className="required">*</span></label>
                            <div className="select-wrapper">
                              <select 
                                name="gender" 
                                value={newDriver.gender} 
                                onChange={handleDriverInput}
                                required
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              <span className="select-arrow">▼</span>
                            </div>
                          </div>
                          
                          {/* Base Salary */}
                          <div className="form-group">
                            <label>Base Salary (Monthly) <span className="required">*</span></label>
                            <div className="input-with-icon">
                              <input 
                                type="number" 
                                name="salary" 
                                placeholder="e.g., 25000" 
                                value={newDriver.salary} 
                                onChange={handleDriverInput}
                                min="0"
                                step="500"
                                className={!newDriver.salary && submitStatus ? 'error' : ''}
                                required 
                              />
                              <span className="input-icon">💰</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Document Uploads Section */}
                      <div className="form-section">
                        <h4 className="section-title">Document Uploads</h4>
                        <div className="form-grid">
                          {/* License Image */}
                          <div className="form-group">
                            <label>Driver's License <span className="required">*</span></label>
                            <label className={`file-upload-label ${!newDriver.licenseImage && submitStatus ? 'error' : ''}`}>
                              <input 
                                type="file" 
                                name="licenseImage" 
                                accept="image/jpeg, image/png"
                                onChange={handleFileChange}
                                className="file-input"
                                required 
                              />
                              <div className="file-upload-content">
                                <FaUpload className="upload-icon" />
                                <span className="file-upload-text">
                                  {newDriver.licenseImage ? (
                                    <span className="file-name">{newDriver.licenseImage.name}</span>
                                  ) : (
                                    <>
                                      <strong>Upload License</strong>
                                      <span className="file-upload-hint">JPG or PNG (max 5MB)</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </label>
                          </div>
                          
                          {/* Aadhaar Image */}
                          <div className="form-group">
                            <label>Aadhaar Card <span className="required">*</span></label>
                            <label className={`file-upload-label ${!newDriver.aadhaarCardImage && submitStatus ? 'error' : ''}`}>
                              <input 
                                type="file" 
                                name="aadhaarCardImage" 
                                accept="image/jpeg, image/png"
                                onChange={handleFileChange}
                                className="file-input"
                                required 
                              />
                              <div className="file-upload-content">
                                <FaUpload className="upload-icon" />
                                <span className="file-upload-text">
                                  {newDriver.aadhaarCardImage ? (
                                    <span className="file-name">{newDriver.aadhaarCardImage.name}</span>
                                  ) : (
                                    <>
                                      <strong>Upload Aadhaar</strong>
                                      <span className="file-upload-hint">JPG or PNG (max 5MB)</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setNewDriver({ 
                              fullName: '', 
                              phoneNumber: '', 
                              email: '', 
                              gender: 'Male',
                              vehicleNumber: '',
                              vehicleType: 'Sedan',
                              licenseImage: null,
                              aadhaarCardImage: null
                            });
                          }}
                        >
                          Reset Form
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner"></span>
                              <span>Registering...</span>
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="btn-icon" />
                              <span>{newDriver.isEditing ? 'Update Driver' : 'Register Driver'}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="form-note">Fields marked with <span className="required">*</span> are required</p>
                    </div>
                  </form>
                  )}
                </div>
              )}
              
              {activeDriverSubmenu === 'salary-management' && (
                <div className="salary-management-container">
                  <div className="section-header">
                    <h3>Driver Salary Management</h3>
                  </div>
                  <DriverSalaryManagement 
                    driverId={selectedDriverForSalary}
                    drivers={drivers}
                    onDriverSelect={(driverId) => setSelectedDriverForSalary(driverId)}
                  />
                  {!selectedDriverForSalary && (
                    <div className="text-center py-8 text-gray-500">
                      <FaMoneyBillWave className="mx-auto text-4xl mb-4 text-gray-300" />
                      <p>Please select a driver to manage their salary and advances</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeDriverSubmenu === 'manage-drivers' && (
                <div className="manage-drivers-container">
                  <div className="section-header">
                    <h3>Manage Drivers</h3>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setActiveDriverSubmenu('add-driver');
                      }}
                    >
                      <FaUserPlus /> Add New Driver
                    </button>
                  </div>
                  
                  {isLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading drivers...</p>
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <p>{error}</p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setActiveDriverSubmenu('manage-drivers')}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="admin-table-premium">
                      <table>
                        <thead>
                          <tr>
                            <th>Driver ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drivers.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="no-data">
                                No drivers found. Add a new driver to get started.
                              </td>
                            </tr>
                          ) : (
                            drivers.map((driver) => (
                              <tr key={driver._id} onClick={() => activeDriverSubmenu === 'salary-management' && fetchDriverReport(driver._id)} style={{ cursor: activeDriverSubmenu === 'salary-management' ? 'pointer' : 'default' }}>
                                <td>{driver._id.substring(0, 6)}...</td>
                                <td>{driver.fullName}</td>
                                <td>{driver.email}</td>
                                <td>{driver.phoneNumber}</td>
                                <td>
                                  <span className={`status-badge ${driver.status?.toLowerCase() || 'inactive'}`}>
                                    {driver.status || 'Inactive'}
                                  </span>
                                </td>
                                <td className="actions">
                                <i className="fas fa-eye"></i>
                                  <button 
                                    className="btn-icon" 
                                    title="View Details"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeDriverSubmenu === 'salary-management') {
                                        fetchDriverReport(driver._id);
                                      }
                                    }}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button 
                                    className="btn-icon" 
                                    title="Edit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditDriver(driver);
                                    }}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="btn-icon danger" 
                                    title="Delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDriver(driver._id);
                                    }}
                                  >
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Bookings */}
          {active === 'bookings' && (
            <section>
              <h3>All Bookings</h3>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : bookingsError ? (
                <p style={{ color: 'red' }}>{bookingsError}</p>
              ) : bookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                <div className="admin-table-premium">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Pickup</th>
                        <th>Drop</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Driver</th>
                        <th>Vehicle</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, idx) => (
                        <tr key={b._id || idx}>
                          <td>{b._id}</td>
                          <td>{b.pickup}</td>
                          <td>{b.dropoff}</td>
                          <td>{b.date ? new Date(b.date).toLocaleString() : '-'}</td>
                          <td>
                            {b.status === 'accepted' ? (
                              <span className="badge bg-success">Accepted</span>
                            ) : b.status === 'assigned' ? (
                              <span className="badge bg-info">Assigned</span>
                            ) : b.status === 'pending' ? (
                              <span className="badge bg-warning text-dark">Pending</span>
                            ) : b.status === 'denied' ? (
                              <span className="badge bg-danger">Denied</span>
                            ) : b.status === 'completed' ? (
                              <span className="badge bg-secondary">Completed</span>
                            ) : (
                              <span className="badge bg-light text-dark">{b.status}</span>
                            )}
                          </td>
                          <td>
                            {b.assignedDriver ? (
                              <span>{b.assignedDriver.fullName}</span>
                            ) : (
                              <span className="text-muted">Not assigned</span>
                            )}
                          </td>
                          <td>
                            {b.vehicleNumber || (
                              <span className="text-muted">Not assigned</span>
                            )}
                          </td>
                          <td className="action-buttons">
                            <button 
                              className="btn-icon primary"
                              title="Assign Driver"
                              onClick={() => handleAssignClick(b._id)}
                            >
                              <FaUserPlus />
                            </button>
                            <button 
                              className="btn-icon secondary"
                              title="Assign Vehicle"
                              onClick={() => handleAssignVehicleClick(b._id)}
                            >
                              <FaCar />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      
      {/* Vehicle Assignment Modal */}
      {showVehicleAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Assign Vehicle</h2>
            
            {vehicleAssignmentError && (
              <div className="alert alert-danger">{vehicleAssignmentError}</div>
            )}
            
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter vehicle number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                disabled={isAssigningVehicle}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowVehicleAssignment(false);
                  setVehicleNumber('');
                  setVehicleAssignmentError('');
                }}
                disabled={isAssigningVehicle}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAssignVehicle}
                disabled={isAssigningVehicle}
              >
                {isAssigningVehicle ? 'Assigning...' : 'Assign Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Driver Assignment Modal */}
      {showDriverAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Assign Driver</h2>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto', width: '2rem', height: '2rem' }}></div>
                <p>Loading available drivers...</p>
              </div>
            ) : availableDrivers.length === 0 ? (
              <p>No drivers available for assignment.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Select a Driver
                  </label>
                  <select
                    value={selectedDriver || ''}
                    onChange={(e) => setSelectedDriverForAssignment(e.target.value)}
                    disabled={isAssigning}
                    className="form-select"
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.fullName} 
                      </option>
                    ))}
                  </select>
                </div>

                {assignmentError && (
                  <div className="assignment-error">
                    {assignmentError}
                  </div>
                )}

                <div className="modal-buttons">
                  <button
                    onClick={() => setShowDriverAssignment(false)}
                    disabled={isAssigning}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignDriver}
                    disabled={!selectedDriverForAssignment || isAssigning}
                    className="btn-primary"
                  >
                    {isAssigning ? (
                      <>
                        <span className="spinner"></span>
                        Assigning...
                      </>
                    ) : 'Assign Driver'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Driver Details</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedDriver(null)}
              >
                &times;
              </button>
            </div>
            
            {isLoadingReport ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading driver details...</p>
              </div>
            ) : driverReport ? (
              <div className="driver-details">
                {/* Profile Section */}
                <div className="details-section">
                  <h3>Profile Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{driverReport.driver.fullName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{driverReport.driver.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{driverReport.driver.phoneNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${driverReport.driver.status?.toLowerCase() || 'inactive'}`}>
                        {driverReport.driver.status || 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="details-section">
                  <h3>Salary Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Monthly Salary:</span>
                      <span className="detail-value">{formatCurrency(driverReport.salary)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Advances:</span>
                      <span className="detail-value">{formatCurrency(driverReport.totalAdvance)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Remaining Salary:</span>
                      <span className="detail-value">{formatCurrency(driverReport.remainingSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="details-section">
                  <h3>Recent Bookings</h3>
                  {driverReport.bookings && driverReport.bookings.length > 0 ? (
                    <div className="bookings-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Pickup</th>
                            <th>Drop</th>
                            <th>Fare</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {driverReport.bookings.slice(0, 5).map(booking => (
                            <tr key={booking._id}>
                              <td>{booking._id.substring(0, 6)}...</td>
                              <td>{booking.pickup}</td>
                              <td>{booking.dropoff}</td>
                              <td>{formatCurrency(booking.fare)}</td>
                              <td>
                                <span className={`status-badge ${booking.status?.toLowerCase() || 'pending'}`}>
                                  {booking.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No bookings found for this driver.</p>
                  )}
                </div>

                {/* Summary */}
                <div className="details-section summary-section">
                  <div className="summary-item">
                    <span className="summary-label">Total Rides:</span>
                    <span className="summary-value">{driverReport.completedBookings}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Earnings:</span>
                    <span className="summary-value">{formatCurrency(driverReport.totalEarnings)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-message">
                <p>Failed to load driver details... Please try again.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => fetchDriverReport(selectedDriver)}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Admin;
