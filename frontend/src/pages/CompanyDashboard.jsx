import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import RideTable from '../components/RideTable';
import sampleRides from '../data/sampleRides';
import Footer from '../components/Footer';
import './CompanyDashboard.css';

const sections = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'billing', label: 'Billing' },
  { key: 'rides', label: 'Rides' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
];

const cardIcons = [
  '🚗', // Total Rides
  '✅', // Completed
  '⏳', // Pending
];

const CompanyDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', email: 'john@company.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com' },
  ]);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '' });

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <div className="row mb-4 justify-content-center">
              <div className="col-md-4">
                <DashboardCard title="Total Rides" value={sampleRides.length} icon={cardIcons[0]} />
              </div>
              <div className="col-md-4">
                <DashboardCard title="Completed" value={sampleRides.filter(r => r.status === 'Completed').length} icon={cardIcons[1]} />
              </div>
              <div className="col-md-4">
                <DashboardCard title="Pending" value={sampleRides.filter(r => r.status === 'Pending').length} icon={cardIcons[2]} />
              </div>
            </div>
            <div className="table-card-container">
              <RideTable rides={sampleRides} />
            </div>
          </>
        );
      case 'employees':
        return (
          <div className="p-4">
            <h3 className="mb-4" style={{ color: '#2b7cff', fontWeight: 700 }}>Employees</h3>
            <form className="mb-4" onSubmit={handleAddEmployee} style={{ maxWidth: 400 }}>
              <div className="row g-2 align-items-end">
                <div className="col">
                  <input type="text" className="form-control" name="name" placeholder="Name" value={newEmployee.name} onChange={handleEmployeeInput} />
                </div>
                <div className="col">
                  <input type="email" className="form-control" name="email" placeholder="Email" value={newEmployee.email} onChange={handleEmployeeInput} />
                </div>
                <div className="col-auto">
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </div>
            </form>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRemoveEmployee(emp.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="p-4">
            <h3 className="mb-4" style={{ color: '#2b7cff', fontWeight: 700 }}>Billing</h3>
            <div className="card p-4 shadow-sm" style={{ borderRadius: 16, background: '#fff' }}>
              <p>Invoices and ride expenses will be shown here.</p>
            </div>
          </div>
        );
      case 'rides':
        return <div className="table-card-container"><RideTable rides={sampleRides} /></div>;
      case 'profile':
        return <div className="p-4"><h3>Profile</h3><p>Profile details and edit form will go here.</p></div>;
      case 'settings':
        return <div className="p-4"><h3>Settings</h3><p>Settings options will go here.</p></div>;
      default:
        return null;
    }
  };

  const handleEmployeeInput = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return;
    setEmployees((prev) => [
      ...prev,
      { id: prev.length + 1, name: newEmployee.name, email: newEmployee.email },
    ]);
    setNewEmployee({ name: '', email: '' });
  };
  const handleRemoveEmployee = (id) => {
    setEmployees((prev) => prev.filter(emp => emp.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-root d-flex">
        {/* Sidebar */}
        <nav className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
             >
          <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <span className="fw-bold">Menu</span>
            <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(false)}>&times;</button>
          </div>
          <ul className="nav flex-column p-2">
            {sections.map(section => (
              <li className="nav-item" key={section.key}>
                <button
                  className={`nav-link btn btn-link text-start w-100 ${activeSection === section.key ? 'active fw-bold' : ''}`}
                  onClick={() => { setActiveSection(section.key); setSidebarOpen(false); }}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)}></div>}
        {/* Main Content */}
        <div className="dashboard-content flex-grow-1">
          <div className="container-fluid mt-4">
            {/* Hamburger for mobile */}
            <button className="btn btn-outline-primary mb-3 d-md-none" onClick={() => setSidebarOpen(true)}>
              <span className="navbar-toggler-icon"></span> Menu
            </button>
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard; 