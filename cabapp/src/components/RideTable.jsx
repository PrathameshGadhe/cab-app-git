import React from 'react';

const RideTable = ({ rides }) => (
  <table className="table table-striped">
    <thead>
      <tr>
        <th>Ride ID</th>
        <th>Driver</th>
        <th>Passenger</th>
        <th>Status</th>
        <th>Fare</th>
      </tr>
    </thead>
    <tbody>
      {rides.map((ride) => (
        <tr key={ride.id}>
          <td>{ride.id}</td>
          <td>{ride.driver}</td>
          <td>{ride.passenger}</td>
          <td>{ride.status}</td>
          <td>{ride.fare}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default RideTable; 