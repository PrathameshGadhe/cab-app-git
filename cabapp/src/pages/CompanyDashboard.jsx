import React from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import RideTable from '../components/RideTable';
import sampleRides from '../data/sampleRides';
import Footer from '../components/Footer';

const CompanyDashboard = () => (
  <>
    <Navbar />
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-4">
          <DashboardCard title="Total Rides" value={sampleRides.length} />
        </div>
        <div className="col-md-4">
          <DashboardCard title="Completed" value={sampleRides.filter(r => r.status === 'Completed').length} />
        </div>
        <div className="col-md-4">
          <DashboardCard title="Pending" value={sampleRides.filter(r => r.status === 'Pending').length} />
        </div>
      </div>
      <RideTable rides={sampleRides} />
      <Footer />
    </div>
  </>
);

export default CompanyDashboard; 