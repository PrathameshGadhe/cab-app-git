// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
// import DashboardCard from '../components/DashboardCard';
// import Footer from '../components/Footer';
// import './CompanyDashboard.css';
// import { toast } from 'react-toastify';
// import { FaUsers, FaCar, FaCheckCircle, FaClock, FaRupeeSign, FaPlus, FaEdit, FaEye } from 'react-icons/fa';

// const sections = [
//   { key: 'dashboard', label: 'Dashboard', icon: '📊' },
//   {
//     key: 'employees',
//     label: 'Employees',
//     icon: '👥',
//     submenu: [
//       { key: 'employee-registration', label: 'Employee Registration', icon: '➕' },
//       { key: 'employee-management', label: 'Employee Management', icon: '👥' }
//     ]
//   },
//   { key: 'bookings', label: 'Bookings', icon: '🚗' },
//   { key: 'billing', label: 'Billing', icon: '💰' },
//   { key: 'profile', label: 'Profile', icon: '👤' },
//   { key: 'settings', label: 'Settings', icon: '⚙️' },
// ];

// const CompanyDashboard = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [activeSection, setActiveSection] = useState('dashboard');
//   const [activeSubmenu, setActiveSubmenu] = useState('employee-management');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     totalBookings: 0,
//     completedBookings: 0,
//     pendingBookings: 0,
//     totalRevenue: 0
//   });
//   const [bookings, setBookings] = useState([]);
//   const [newEmployee, setNewEmployee] = useState({
//     employeeId: '',
//     employeeName: '',
//     email: '',
//     password: ''
//   });
//   const [employeeError, setEmployeeError] = useState('');
//   const [employeeLoading, setEmployeeLoading] = useState(false);

//   // Fetch dashboard stats
//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/company/stats', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setStats(data.stats);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };



//   // Fetch bookings
//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/company/bookings', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setBookings(data.bookings || []);
//       } else {
//         toast.error(data.message || 'Failed to fetch bookings');
//       }
//     } catch (error) {
//       toast.error('Server error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   useEffect(() => {
//     if (activeSection === 'bookings') {
//       fetchBookings();
//     }
//   }, [activeSection]);



//   const handleEmployeeInput = (e) => {
//     const { name, value } = e.target;
//     setNewEmployee((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddEmployee = async (e) => {
//     e.preventDefault();
//     setEmployeeError('');
//     if (!newEmployee.employeeId || !newEmployee.employeeName || !newEmployee.email || !newEmployee.password) {
//       setEmployeeError('All fields are required.');
//       return;
//     }
//     setEmployeeLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/company/employees', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(newEmployee)
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         setEmployeeError(data.message || 'Failed to add employee');
//       } else {
//         toast.success('Employee registered successfully!');
//         setNewEmployee({ employeeId: '', employeeName: '', email: '', password: '' });
//         fetchStats(); // Refresh stats to update employee count
//         setActiveSubmenu('employee-management'); // Switch to management view
//       }
//     } catch (err) {
//       setEmployeeError('Server error. Try again.');
//     } finally {
//       setEmployeeLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       'pending': { color: 'warning', text: 'Pending' },
//       'assigned': { color: 'info', text: 'Assigned' },
//       'accepted': { color: 'primary', text: 'Accepted' },
//       'completed': { color: 'success', text: 'Completed' },
//       'denied': { color: 'danger', text: 'Denied' }
//     };
//     const config = statusConfig[status] || { color: 'secondary', text: status };
//     return <span className={`badge bg-${config.color}`}>{config.text}</span>;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (timeString) => {
//     return timeString;
//   };

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'dashboard':
//         return (
//           <div className="p-4">
//             <div className="row mb-4">
//               <div className="col-md-3 mb-3">
//                 <DashboardCard
//                   title="Total Employees"
//                   value={stats.totalEmployees}
//                   icon={<FaUsers className="text-primary" />}
//                   color="primary"
//                 />
//               </div>
//               <div className="col-md-3 mb-3">
//                 <DashboardCard
//                   title="Total Bookings"
//                   value={stats.totalBookings}
//                   icon={<FaCar className="text-info" />}
//                   color="info"
//                 />
//               </div>
//               <div className="col-md-3 mb-3">
//                 <DashboardCard
//                   title="Completed Rides"
//                   value={stats.completedBookings}
//                   icon={<FaCheckCircle className="text-success" />}
//                   color="success"
//                 />
//               </div>
//               <div className="col-md-3 mb-3">
//                 <DashboardCard
//                   title="Total Revenue"
//                   value={`₹${stats.totalRevenue.toLocaleString()}`}
//                   icon={<FaRupeeSign className="text-warning" />}
//                   color="warning"
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-12">
//                 <div className="card shadow-sm">
//                   <div className="card-header bg-white">
//                     <h5 className="mb-0 text-primary fw-bold">
//                       <FaCar className="me-2" />
//                       Recent Bookings
//                     </h5>
//                   </div>
//                   <div className="card-body">
//                     {loading ? (
//                       <div className="text-center py-4">
//                         <div className="spinner-border text-primary" role="status">
//                           <span className="visually-hidden">Loading...</span>
//                         </div>
//                       </div>
//                     ) : bookings.length === 0 ? (
//                       <div className="text-center py-4 text-muted">
//                         <FaCar className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
//                         <p>No bookings found</p>
//                       </div>
//                     ) : (
//                       <div className="table-responsive">
//                         <table className="table table-hover">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Employee</th>
//                               <th>Route</th>
//                               <th>Date & Time</th>
//                               <th>Status</th>
//                               <th>Fare</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {bookings.slice(0, 5).map((booking) => (
//                               <tr key={booking._id}>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     <div className="avatar-circle bg-primary text-white me-2">
//                                       {booking.userId?.employeeName?.[0] || 'E'}
//                                     </div>
//                                     <div>
//                                       <div className="fw-bold">{booking.userId?.employeeName}</div>
//                                       <small className="text-muted">{booking.userId?.email}</small>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div className="fw-bold">{booking.pickup}</div>
//                                     <small className="text-muted">→ {booking.dropoff}</small>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div>{formatDate(booking.date)}</div>
//                                     <small className="text-muted">{formatTime(booking.time)}</small>
//                                   </div>
//                                 </td>
//                                 <td>{getStatusBadge(booking.status)}</td>
//                                 <td className="fw-bold">₹{booking.fare}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 'employees':
//         return (
//           <div className="p-4">
//             <div className="mb-3">
//               <h4 className="text-primary fw-bold mb-0">
//                 <FaUsers className="me-2" />
//                 Employee Management
//               </h4>
//             </div>

//             {activeSubmenu === 'employee-registration' ? (
//               <div className="card shadow-sm">
//                 <div className="card-header bg-primary text-white">
//                   <h6 className="mb-0">
//                     <FaPlus className="me-2" />
//                     Register New Employee
//                   </h6>
//                 </div>
//                 <div className="card-body">
//                   {/*} <form onSubmit={handleAddEmployee}>
//                     <div className="row">
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Employee ID</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           name="employeeId"
//                           value={newEmployee.employeeId}
//                           onChange={handleEmployeeInput}
//                           required
//                           placeholder="Enter employee ID"
//                         />
//                       </div>
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Employee Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           name="employeeName"
//                           value={newEmployee.employeeName}
//                           onChange={handleEmployeeInput}
//                           required
//                           placeholder="Enter employee name"
//                         />
//                       </div>
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Email</label>
//                         <input
//                           type="email"
//                           className="form-control"
//                           name="email"
//                           value={newEmployee.email}
//                           onChange={handleEmployeeInput}
//                           required
//                           placeholder="Enter email address"
//                         />
//                       </div>
//                       <div className="col-md-6 mb-3">
//                         <label className="form-label">Password</label>
//                         <input
//                           type="password"
//                           className="form-control"
//                           name="password"
//                           value={newEmployee.password}
//                           onChange={handleEmployeeInput}
//                           required
//                           placeholder="Enter password"
//                         />
//                       </div>
//                     </div>
//                     {employeeError && (
//                       <div className="alert alert-danger">{employeeError}</div>
//                     )}
//                     <div className="d-flex justify-content-end">
//                       <button type="submit" className="btn btn-primary" disabled={employeeLoading}>
//                         {employeeLoading ? (
//                           <>
//                             <span className="spinner-border spinner-border-sm me-2"></span>
//                             Registering...
//                           </>
//                         ) : (
//                           <>
//                             <FaPlus className="me-2" />
//                             Register Employee
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </form>*/}
//                   <form onSubmit={handleAddEmployee}>
//                     <div className="mb-3">
//                       <label className="form-label">Employee ID</label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         name="employeeId"
//                         value={newEmployee.employeeId}
//                         onChange={handleEmployeeInput}
//                         required
//                         placeholder="Enter employee ID"
//                       />
//                     </div>

//                     <div className="mb-3">
//                       <label className="form-label">Employee Name</label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         name="employeeName"
//                         value={newEmployee.employeeName}
//                         onChange={handleEmployeeInput}
//                         required
//                         placeholder="Enter employee name"
//                       />
//                     </div>

//                     <div className="mb-3">
//                       <label className="form-label">Email</label>
//                       <input
//                         type="email"
//                         className="form-control"
//                         name="email"
//                         value={newEmployee.email}
//                         onChange={handleEmployeeInput}
//                         required
//                         placeholder="Enter email address"
//                       />
//                     </div>

//                     <div className="mb-3">
//                       <label className="form-label">Password</label>
//                       <input
//                         type="password"
//                         className="form-control"
//                         name="password"
//                         value={newEmployee.password}
//                         onChange={handleEmployeeInput}
//                         required
//                         placeholder="Enter password"
//                       />
//                     </div>

//                     {employeeError && (
//                       <div className="alert alert-danger">{employeeError}</div>
//                     )}

//                     <div className="d-flex justify-content-end">
//                       <button type="submit" className="btn btn-primary" disabled={employeeLoading}>
//                         {employeeLoading ? (
//                           <>
//                             <span className="spinner-border spinner-border-sm me-2"></span>
//                             Registering...
//                           </>
//                         ) : (
//                           <>
//                             <FaPlus className="me-2" />
//                             Register Employee
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </form>

//                 </div>
//               </div>
//             ) : (
//               <div className="card shadow-sm">
//                 <div className="card-header bg-primary text-white">
//                   <h6 className="mb-0">
//                     <FaUsers className="me-2" />
//                     Employee Management
//                   </h6>
//                 </div>
//                 {/*  <div className="card-body">
//                   <p className="text-muted mb-0">Employee management features coming soon...</p>
//                 </div>*/}


//                 <div className="card-body">
//                   {loading ? (
//                     <p>Loading employees...</p>
//                   ) : error ? (
//                     <div className="alert alert-danger">{error}</div>
//                   ) : employees.length === 0 ? (
//                     <p className="text-muted">No employees found.</p>
//                   ) : (
//                     <ul className="list-group">
//                       {employees.map(emp => (
//                         <li key={emp._id} className="list-group-item d-flex justify-content-between align-items-center">
//                           <div>
//                             <strong>{emp.employeeName}</strong> <br />
//                             <small className="text-muted">{emp.email}</small>
//                           </div>
//                           <button
//                             className="btn btn-sm btn-danger"
//                             onClick={() => handleDelete(emp.employeeId)}
//                           >
//                             Delete
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>



//               </div>


//             )}
//           </div>
//         );

//       case 'bookings':
//         return (
//           <div className="p-4">
//             <h3 className="text-primary fw-bold mb-4">
//               <FaCar className="me-2" />
//               All Bookings
//             </h3>

//             {loading ? (
//               <div className="text-center py-5">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </div>
//             ) : (
//               <div className="card shadow-sm">
//                 <div className="card-body">
//                   <div className="table-responsive">
//                     <table className="table table-hover">
//                       <thead className="table-light">
//                         <tr>
//                           <th>Employee</th>
//                           <th>Route</th>
//                           <th>Date & Time</th>
//                           <th>Cab Type</th>
//                           <th>Status</th>
//                           <th>Fare</th>
//                           <th>Driver</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {bookings.length === 0 ? (
//                           <tr>
//                             <td colSpan="7" className="text-center py-4">
//                               <FaCar className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
//                               <p className="text-muted">No bookings found</p>
//                             </td>
//                           </tr>
//                         ) : (
//                           bookings.map((booking) => (
//                             <tr key={booking._id}>
//                               <td>
//                                 <div className="d-flex align-items-center">
//                                   <div className="avatar-circle bg-primary text-white me-2">
//                                     {booking.userId?.employeeName?.[0] || 'E'}
//                                   </div>
//                                   <div>
//                                     <div className="fw-bold">{booking.userId?.employeeName}</div>
//                                     <small className="text-muted">{booking.userId?.email}</small>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td>
//                                 <div>
//                                   <div className="fw-bold">{booking.pickup}</div>
//                                   <small className="text-muted">→ {booking.dropoff}</small>
//                                 </div>
//                               </td>
//                               <td>
//                                 <div>
//                                   <div>{formatDate(booking.date)}</div>
//                                   <small className="text-muted">{formatTime(booking.time)}</small>
//                                 </div>
//                               </td>
//                               <td>
//                                 <span className="badge bg-info">{booking.cabType}</span>
//                               </td>
//                               <td>{getStatusBadge(booking.status)}</td>
//                               <td className="fw-bold">₹{booking.fare}</td>
//                               <td>
//                                 {booking.assignedDriver ? (
//                                   <div>
//                                     <div className="fw-bold">{booking.assignedDriver.fullName}</div>
//                                     <small className="text-muted">{booking.assignedDriver.vehicleNumber}</small>
//                                   </div>
//                                 ) : (
//                                   <span className="text-muted">Not assigned</span>
//                                 )}
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case 'billing':
//         return (
//           <div className="p-4">
//             <h3 className="text-primary fw-bold mb-4">
//               <FaRupeeSign className="me-2" />
//               Billing & Analytics
//             </h3>
//             <div className="row">
//               <div className="col-md-6 mb-4">
//                 <div className="card shadow-sm h-100">
//                   <div className="card-header bg-white">
//                     <h5 className="mb-0 text-primary">Revenue Overview</h5>
//                   </div>
//                   <div className="card-body">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <span>Total Revenue</span>
//                       <span className="fw-bold text-success">₹{stats.totalRevenue.toLocaleString()}</span>
//                     </div>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <span>Completed Rides</span>
//                       <span className="fw-bold">{stats.completedBookings}</span>
//                     </div>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <span>Average per Ride</span>
//                       <span className="fw-bold">
//                         ₹{stats.completedBookings > 0 ? Math.round(stats.totalRevenue / stats.completedBookings) : 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-6 mb-4">
//                 <div className="card shadow-sm h-100">
//                   <div className="card-header bg-white">
//                     <h5 className="mb-0 text-primary">Booking Statistics</h5>
//                   </div>
//                   <div className="card-body">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <span>Total Bookings</span>
//                       <span className="fw-bold">{stats.totalBookings}</span>
//                     </div>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <span>Pending</span>
//                       <span className="fw-bold text-warning">{stats.pendingBookings}</span>
//                     </div>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <span>Completion Rate</span>
//                       <span className="fw-bold text-success">
//                         {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 'profile':
//         return (
//           <div className="p-4">
//             <h3 className="text-primary fw-bold mb-4">
//               <FaEye className="me-2" />
//               Company Profile
//             </h3>
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <p>Company profile management will be implemented here.</p>
//               </div>
//             </div>
//           </div>
//         );

//       case 'settings':
//         return (
//           <div className="p-4">
//             <h3 className="text-primary fw-bold mb-4">
//               <FaEdit className="me-2" />
//               Settings
//             </h3>
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <p>Company settings and preferences will be implemented here.</p>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="dashboard-root d-flex">
//         {/* Sidebar */}
//         <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
//           <div className="sidebar-branding d-flex flex-column align-items-center p-4 border-bottom">
//             <div className="dashboard-logo mb-2">
//               <span role="img" aria-label="logo" style={{ fontSize: 38 }}>🚕</span>
//             </div>
//             <div className="dashboard-company-name fw-bold" style={{ fontSize: 20, letterSpacing: 1 }}>CabApp</div>
//           </div>
//           <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
//             <span className="fw-bold">Menu</span>
//             <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(false)}>&times;</button>
//           </div>
//           <ul className="nav flex-column p-2 mt-2">
//             {sections.map(section => (
//               <li className="nav-item" key={section.key}>
//                 <button
//                   className={`nav-link btn btn-link text-start w-100 ${activeSection === section.key ? 'active fw-bold' : ''}`}
//                   onClick={() => {
//                     setActiveSection(section.key);
//                     setActiveSubmenu(null);
//                     setSidebarOpen(false);
//                   }}
//                 >
//                   <span className="me-2">{section.icon}</span>
//                   {section.label}
//                 </button>
//                 {section.submenu && activeSection === section.key && (
//                   <ul className="nav flex-column ms-2 mt-1">
//                     {section.submenu.map(subItem => (
//                       <li className="nav-item" key={subItem.key}>
//                         <button
//                           className={`nav-link btn btn-link text-start w-100 submenu-item ${activeSubmenu === subItem.key ? 'active' : ''}`}
//                           onClick={() => {
//                             setActiveSubmenu(subItem.key);
//                             setSidebarOpen(false);
//                           }}
//                         >
//                           <span className="me-2 submenu-icon">{subItem.icon}</span>
//                           <span className="submenu-text">{subItem.label}</span>
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* Overlay for mobile */}
//         {sidebarOpen && <div className="sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)}></div>}

//         {/* Main Content */}
//         <div className="dashboard-content flex-grow-1">
//           <div className="container-fluid mt-4">
//             {/* Sticky header for dashboard title */}
//             <div className="dashboard-header sticky-top bg-white mb-3 py-2 px-2 d-flex align-items-center justify-content-between" style={{ zIndex: 1020, borderRadius: 12, boxShadow: '0 2px 12px rgba(80,80,160,0.06)' }}>
//               <h2 className="dashboard-title mb-0" style={{ fontWeight: 800, color: '#2b7cff', fontSize: '2rem', letterSpacing: 1 }}>Company Dashboard</h2>
//               {/* Hamburger for mobile */}
//               <button className="btn btn-outline-primary d-md-none" onClick={() => setSidebarOpen(true)}>
//                 <span className="navbar-toggler-icon"></span> Menu
//               </button>
//             </div>
//             {renderContent()}
//           </div>
//         </div>
//       </div>



//       <Footer />
//     </>
//   );
// };

// export default CompanyDashboard; 


import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import Footer from '../components/Footer';
import './CompanyDashboard.css';
import { toast } from 'react-toastify';
import { FaUsers, FaCar, FaCheckCircle, FaClock, FaRupeeSign, FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';

const sections = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  {
    key: 'employees',
    label: 'Employees',
    icon: '👥',
    submenu: [
      { key: 'employee-registration', label: 'Employee Registration', icon: '➕' },
      { key: 'employee-management', label: 'Employee Management', icon: '👥' }
    ]
  },
  { key: 'bookings', label: 'Bookings', icon: '🚗' },
  { key: 'billing', label: 'Billing', icon: '💰' },
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const CompanyDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeSubmenu, setActiveSubmenu] = useState('employee-management');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });
  const [bookings, setBookings] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    employeeName: '',
    email: '',
    password: ''
  });
  const [employeeError, setEmployeeError] = useState('');
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/company/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/company/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/company/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/company/employees/${employeeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Employee deleted successfully');
          fetchEmployees(); // Refresh the list
          fetchStats(); // Update the stats
        } else {
          toast.error(data.message || 'Failed to delete employee');
        }
      } catch (error) {
        toast.error('Server error. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeSection === 'employees' && activeSubmenu === 'employee-management') {
      fetchEmployees();
    }
  }, [activeSection, activeSubmenu]);

  useEffect(() => {
    if (activeSection === 'bookings') {
      fetchBookings();
    }
  }, [activeSection]);

  const handleEmployeeInput = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmployeeError('');
    if (!newEmployee.employeeId || !newEmployee.employeeName || !newEmployee.email || !newEmployee.password) {
      setEmployeeError('All fields are required.');
      return;
    }
    setEmployeeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/company/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
      });
      const data = await response.json();
      if (!response.ok) {
        setEmployeeError(data.message || 'Failed to add employee');
      } else {
        toast.success('Employee registered successfully!');
        setNewEmployee({ employeeId: '', employeeName: '', email: '', password: '' });
        fetchStats(); // Refresh stats to update employee count
        fetchEmployees(); // Refresh the employee list
        setActiveSubmenu('employee-management'); // Switch to management view
      }
    } catch (err) {
      setEmployeeError('Server error. Try again.');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Pending' },
      'assigned': { color: 'info', text: 'Assigned' },
      'accepted': { color: 'primary', text: 'Accepted' },
      'completed': { color: 'success', text: 'Completed' },
      'denied': { color: 'danger', text: 'Denied' }
    };
    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="p-4">
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <DashboardCard
                  title="Total Employees"
                  value={stats.totalEmployees}
                  icon={<FaUsers className="text-primary" />}
                  color="primary"
                />
              </div>
              <div className="col-md-3 mb-3">
                <DashboardCard
                  title="Total Bookings"
                  value={stats.totalBookings}
                  icon={<FaCar className="text-info" />}
                  color="info"
                />
              </div>
              <div className="col-md-3 mb-3">
                <DashboardCard
                  title="Completed Rides"
                  value={stats.completedBookings}
                  icon={<FaCheckCircle className="text-success" />}
                  color="success"
                />
              </div>
              <div className="col-md-3 mb-3">
                <DashboardCard
                  title="Total Revenue"
                  value={`₹${stats.totalRevenue.toLocaleString()}`}
                  icon={<FaRupeeSign className="text-warning" />}
                  color="warning"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0 text-primary fw-bold">
                      <FaCar className="me-2" />
                      Recent Bookings
                    </h5>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <FaCar className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
                        <p>No bookings found</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Employee</th>
                              <th>Route</th>
                              <th>Date & Time</th>
                              <th>Status</th>
                              <th>Fare</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.slice(0, 5).map((booking) => (
                              <tr key={booking._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-primary text-white me-2">
                                      {booking.userId?.employeeName?.[0] || 'E'}
                                    </div>
                                    <div>
                                      <div className="fw-bold">{booking.userId?.employeeName}</div>
                                      <small className="text-muted">{booking.userId?.email}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-bold">{booking.pickup}</div>
                                    <small className="text-muted">→ {booking.dropoff}</small>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div>{formatDate(booking.date)}</div>
                                    <small className="text-muted">{formatTime(booking.time)}</small>
                                  </div>
                                </td>
                                <td>{getStatusBadge(booking.status)}</td>
                                <td className="fw-bold">₹{booking.fare}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="p-4">
            <div className="mb-3">
              <h4 className="text-primary fw-bold mb-0">
                <FaUsers className="me-2" />
                Employee Management
              </h4>
            </div>

            {activeSubmenu === 'employee-registration' ? (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <FaPlus className="me-2" />
                    Register New Employee
                  </h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddEmployee}>
                    <div className="mb-3">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        className="form-control"
                        name="employeeId"
                        value={newEmployee.employeeId}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="Enter employee ID"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Employee Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="employeeName"
                        value={newEmployee.employeeName}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="Enter employee name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={newEmployee.email}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={newEmployee.password}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="Enter password"
                      />
                    </div>

                    {employeeError && (
                      <div className="alert alert-danger">{employeeError}</div>
                    )}

                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" disabled={employeeLoading}>
                        {employeeLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Registering...
                          </>
                        ) : (
                          <>
                            <FaPlus className="me-2" />
                            Register Employee
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <FaUsers className="me-2" />
                    Employee Management
                  </h6>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : employees.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <FaUsers className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
                      <p>No employees found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((employee) => (
                            <tr key={employee._id}>
                              <td>{employee.employeeId}</td>
                              <td>{employee.employeeName}</td>
                              <td>{employee.email}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(employee.employeeId)}
                                >
                                  <FaTrash className="me-1" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'bookings':
        return (
          <div className="p-4">
            <h3 className="text-primary fw-bold mb-4">
              <FaCar className="me-2" />
              All Bookings
            </h3>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Employee</th>
                          <th>Route</th>
                          <th>Date & Time</th>
                          <th>Cab Type</th>
                          <th>Status</th>
                          <th>Fare</th>
                          <th>Driver</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <FaCar className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
                              <p className="text-muted">No bookings found</p>
                            </td>
                          </tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-circle bg-primary text-white me-2">
                                    {booking.userId?.employeeName?.[0] || 'E'}
                                  </div>
                                  <div>
                                    <div className="fw-bold">{booking.userId?.employeeName}</div>
                                    <small className="text-muted">{booking.userId?.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{booking.pickup}</div>
                                  <small className="text-muted">→ {booking.dropoff}</small>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{formatDate(booking.date)}</div>
                                  <small className="text-muted">{formatTime(booking.time)}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info">{booking.cabType}</span>
                              </td>
                              <td>{getStatusBadge(booking.status)}</td>
                              <td className="fw-bold">₹{booking.fare}</td>
                              <td>
                                {booking.assignedDriver ? (
                                  <div>
                                    <div className="fw-bold">{booking.assignedDriver.fullName}</div>
                                    <small className="text-muted">{booking.assignedDriver.vehicleNumber}</small>
                                  </div>
                                ) : (
                                  <span className="text-muted">Not assigned</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="p-4">
            <h3 className="text-primary fw-bold mb-4">
              <FaRupeeSign className="me-2" />
              Billing & Analytics
            </h3>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0 text-primary">Revenue Overview</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Total Revenue</span>
                      <span className="fw-bold text-success">₹{stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Completed Rides</span>
                      <span className="fw-bold">{stats.completedBookings}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Average per Ride</span>
                      <span className="fw-bold">
                        ₹{stats.completedBookings > 0 ? Math.round(stats.totalRevenue / stats.completedBookings) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0 text-primary">Booking Statistics</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Total Bookings</span>
                      <span className="fw-bold">{stats.totalBookings}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Pending</span>
                      <span className="fw-bold text-warning">{stats.pendingBookings}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Completion Rate</span>
                      <span className="fw-bold text-success">
                        {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4">
            <h3 className="text-primary fw-bold mb-4">
              <FaEye className="me-2" />
              Company Profile
            </h3>
            <div className="card shadow-sm">
              <div className="card-body">
                <p>Company profile management will be implemented here.</p>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4">
            <h3 className="text-primary fw-bold mb-4">
              <FaEdit className="me-2" />
              Settings
            </h3>
            <div className="card shadow-sm">
              <div className="card-body">
                <p>Company settings and preferences will be implemented here.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-root d-flex">
        {/* Sidebar */}
        <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-branding d-flex flex-column align-items-center p-4 border-bottom">
            <div className="dashboard-logo mb-2">
              <span role="img" aria-label="logo" style={{ fontSize: 38 }}>🚕</span>
            </div>
            <div className="dashboard-company-name fw-bold" style={{ fontSize: 20, letterSpacing: 1 }}>CabApp</div>
          </div>
          <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <span className="fw-bold">Menu</span>
            <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(false)}>&times;</button>
          </div>
          <ul className="nav flex-column p-2 mt-2">
            {sections.map(section => (
              <li className="nav-item" key={section.key}>
                <button
                  className={`nav-link btn btn-link text-start w-100 ${activeSection === section.key ? 'active fw-bold' : ''}`}
                  onClick={() => {
                    setActiveSection(section.key);
                    setActiveSubmenu(null);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="me-2">{section.icon}</span>
                  {section.label}
                </button>
                {section.submenu && activeSection === section.key && (
                  <ul className="nav flex-column ms-2 mt-1">
                    {section.submenu.map(subItem => (
                      <li className="nav-item" key={subItem.key}>
                        <button
                          className={`nav-link btn btn-link text-start w-100 submenu-item ${activeSubmenu === subItem.key ? 'active' : ''}`}
                          onClick={() => {
                            setActiveSubmenu(subItem.key);
                            setSidebarOpen(false);
                          }}
                        >
                          <span className="me-2 submenu-icon">{subItem.icon}</span>
                          <span className="submenu-text">{subItem.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <div className="dashboard-content flex-grow-1">
          <div className="container-fluid mt-4">
            {/* Sticky header for dashboard title */}
            <div className="dashboard-header sticky-top bg-white mb-3 py-2 px-2 d-flex align-items-center justify-content-between" style={{ zIndex: 1020, borderRadius: 12, boxShadow: '0 2px 12px rgba(80,80,160,0.06)' }}>
              <h2 className="dashboard-title mb-0" style={{ fontWeight: 800, color: '#2b7cff', fontSize: '2rem', letterSpacing: 1 }}>Company Dashboard</h2>
              {/* Hamburger for mobile */}
              <button className="btn btn-outline-primary d-md-none" onClick={() => setSidebarOpen(true)}>
                <span className="navbar-toggler-icon"></span> Menu
              </button>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CompanyDashboard;