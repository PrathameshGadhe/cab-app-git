import React from 'react';

const RideTable = ({ rides }) => (
  <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', overflow:'hidden', marginBottom:24}}>
    <table className="table mb-0" style={{borderRadius:16, overflow:'hidden'}}>
      <thead>
        <tr style={{background:'linear-gradient(90deg, #2b7cff 0%, #38bdf8 100%)'}}>
          <th style={{color:'#fff', fontWeight:700, border:'none', textAlign:'center'}}>Ride ID</th>
          <th style={{color:'#fff', fontWeight:700, border:'none', textAlign:'center'}}>Driver</th>
          <th style={{color:'#fff', fontWeight:700, border:'none', textAlign:'center'}}>Passenger</th>
          <th style={{color:'#fff', fontWeight:700, border:'none', textAlign:'center'}}>Status</th>
          <th style={{color:'#fff', fontWeight:700, border:'none', textAlign:'center'}}>Fare</th>
        </tr>
      </thead>
      <tbody>
        {rides.map((ride) => (
          <tr key={ride.id} style={{textAlign:'center', verticalAlign:'middle', fontSize:'1.05rem', border:'none'}}>
            <td>{ride.id}</td>
            <td>{ride.driver}</td>
            <td>{ride.passenger}</td>
            <td>{ride.status}</td>
            <td>{ride.fare}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RideTable; 