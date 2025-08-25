import React from 'react';

const DashboardCard = ({ title, value, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  const bgClasses = {
    primary: 'bg-primary',
    info: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    // If icon is a React component (has type property)
    if (typeof icon === 'object' && icon.type) {
      return (
        <div className="mb-2 d-flex align-items-center justify-content-center">
          <span style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: '50%',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            marginBottom: 4,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e2e8f0'
          }}>
            {icon}
          </span>
        </div>
      );
    }
    
    // If icon is a string (emoji or text)
    return (
      <div className="mb-2 d-flex align-items-center justify-content-center">
        <span style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: '#3b82f6',
          marginBottom: 4,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e2e8f0'
        }}>{icon}</span>
      </div>
    );
  };

  return (
    <div className="card text-center mb-4 p-4" style={{
      borderRadius: 16, 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div className="card-body d-flex flex-column justify-content-center align-items-center">
        {renderIcon()}
        <h5 className="card-title fw-bold mb-2" style={{color:'#1e293b', fontSize: '1rem'}}>{title}</h5>
        <p className="card-text mb-0" style={{
          fontWeight: 700, 
          color: '#1e293b', 
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard; 