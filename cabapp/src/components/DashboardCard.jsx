import React from 'react';

const DashboardCard = ({ title, value, icon }) => (
  <div className="card text-center mb-4">
    <div className="card-body">
      {icon && <div className="mb-2">{icon}</div>}
      <h5 className="card-title">{title}</h5>
      <p className="card-text display-6">{value}</p>
    </div>
  </div>
);

export default DashboardCard; 