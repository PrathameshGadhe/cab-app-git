import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaDownload, FaFileInvoice, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import InvoiceModal from '../../components/InvoiceModal';

const Invoices = ({ type }) => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);


// ✅ default filters: no status by default
const [allBookings, setAllBookings] = useState([]);
const [filters, setFilters] = useState({
  sort: '-createdAt',
  limit: 50,
});

// Fetch all bookings on component mount
useEffect(() => {
  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings/allBookings', {
        params: {
          populate: 'userId,assignedDriver,companyId,vehicleId,driverId',
          select: 'bookingId,createdAt,pickup,dropoff,fare,status,userId,assignedDriver,companyId,vehicleId,driverId',
          limit: 1000 // Get all records and handle filtering locally
        }
      });
      setAllBookings(response.data?.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(`Failed to load bookings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAllBookings();
}, []);

// Apply filters to the data
useEffect(() => {
  if (allBookings.length === 0) return;
  
  let filtered = [...allBookings];
  
  // Apply status filter
  if (selectedStatus) {
    filtered = filtered.filter(booking => booking.status === selectedStatus);
  }
  
  // Apply company filter
  if (selectedCompany) {
    filtered = filtered.filter(booking => {
      // Check if booking has company info and matches selected company
      const bookingCompanyId = booking.companyId?._id || booking.companyId || '';
      return bookingCompanyId.toString() === selectedCompany.toString();
    });
  }
  
  // Apply month filter
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }
  
  // Apply search
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filtered = filtered.filter(booking => 
      (booking.bookingId?.toLowerCase().includes(searchLower)) ||
      (booking.userId?.name?.toLowerCase().includes(searchLower)) ||
      (booking.assignedDriver?.fullName?.toLowerCase().includes(searchLower)) ||
      (booking.companyId?.companyName?.toLowerCase().includes(searchLower)) ||
      (booking.status?.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply sorting
  const [field, order] = filters.sort.startsWith('-') 
    ? [filters.sort.substring(1), -1] 
    : [filters.sort, 1];
    
  filtered.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      aValue = a[parent]?.[child];
      bValue = b[parent]?.[child];
    }
    
    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });
  
  // Apply limit
  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  setBookings(filtered);
}, [allBookings, selectedStatus, selectedCompany, selectedMonth, searchQuery, filters]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/company');
        setCompanies(response.data.companies || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };
    fetchCompanies();
  }, []);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  const formatCurrency = (amount) =>
    amount != null
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      : '₹0.00';

  const handleDownloadPDF = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const renderLoadingState = () => (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <FaSpinner className="animate-spin text-3xl text-blue-500 mb-4 mx-auto" />
      <h3 className="text-lg font-medium text-gray-900">Loading Invoices</h3>
      <p className="text-gray-500">Please wait while we fetch your billing records...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  );

  // MAIN Booking Invoice UI
  const renderBookingInvoice = () => (
    <div className="w-full px-4 py-8">
      <div className="w-full max-w-[1400px] mx-auto bg-white p-6 rounded-xl shadow border border-gray-200">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
            <FaFileInvoice className="mr-3 text-blue-600" />
            {type === 'billing' ? 'Billing History' : 'Invoices'}
          </h1>
          
          <div className="flex items-center gap-3 flex-wrap">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="text-xs p-1.5 border rounded w-28"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)} 
              className="text-xs p-1.5 border rounded w-32"
            >
              <option value="">Company</option>
              {companies.map((company) => {
                const companyName = company?.companyName || company?.name || 'Unnamed Company';
                return (
                  <option key={company._id} value={company._id}>
                    {companyName.substring(0, 12)}{companyName.length > 12 ? '...' : ''}
                  </option>
                );
              })}
            </select>
            
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
              className="text-xs p-1.5 border rounded w-24"
            >
              <option value="">Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="text-xs p-1.5 border rounded w-32" 
            />
            
            <button 
              onClick={() => window.print()} 
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
            >
              <FaDownload className="mr-1.5" /> Export
            </button>
          </div>
        </div>







        {/* Content */}
        {error
          ? renderErrorState()
          : isLoading
          ? renderLoadingState()
          : bookings.length > 0
          ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {['Date', 'Pickup', 'Dropoff', 'Driver', 'Vehicle', 'Fare', 'Actions'].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b, idx) => {
                    // Get pickup and dropoff addresses
                    const pickupAddress = typeof b.pickup === 'string' 
                      ? b.pickup 
                      : b.pickup?.address || 'N/A';
                      
                    const dropoffAddress = typeof b.dropoff === 'string'
                      ? b.dropoff
                      : b.dropoff?.address || 'N/A';
                    
                    // Get driver info - check both driverId and assignedDriver
                    const driver = b.driverId || b.assignedDriver;
                    const driverName = driver?.fullName || 'Not Assigned';
                    
                    // Get vehicle info - check both vehicleId and assignedDriver's vehicle
                    const vehicle = b.vehicleId || (b.assignedDriver?.vehicleNumber ? {
                      vehicleNumber: b.assignedDriver.vehicleNumber,
                      model: b.assignedDriver.vehicleType
                    } : null);
                    
                    return (
                      <tr
                        key={b._id}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {formatDate(b.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={pickupAddress}>
                          {pickupAddress}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate" title={dropoffAddress}>
                          {dropoffAddress}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {driverName}
                          {driver?.phoneNumber && (
                            <div className="text-xs text-gray-500">{driver.phoneNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {vehicle?.vehicleNumber || 'N/A'}
                          {vehicle?.model && (
                            <div className="text-xs text-gray-500">{vehicle.model}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-700 whitespace-nowrap">
                          {formatCurrency(b.fare?.total || b.fare || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDownloadPDF(b)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded"
                          >
                            <FaFileInvoice className="text-xs" /> Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
          : <p className="text-center text-gray-500 py-6">No records found</p>
        }
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {renderBookingInvoice()}
      {selectedBooking && (
        <InvoiceModal 
          booking={selectedBooking} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Invoices;

