import React from 'react';

const DashboardCard = ({ title, value, icon }) => (
  <div className="card text-center mb-4 p-3" style={{borderRadius: 18, boxShadow: '0 2px 12px rgba(44,62,80,0.07)'}}>
    <div className="card-body">
      {icon && (
        <div className="mb-2 d-flex align-items-center justify-content-center">
          <span style={{
            background: 'linear-gradient(135deg, #eaf2ff 60%, #dbeafe 100%)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            color: '#2b7cff',
            marginBottom: 6
          }}>{icon}</span>
        </div>
      )}
      <h5 className="card-title fw-bold mb-1" style={{color:'#2b7cff'}}>{title}</h5>
      <p className="card-text display-6 mb-0" style={{fontWeight:700, color:'#1a1a1a'}}>{value}</p>
    </div>
  </div>
);

export default DashboardCard; 