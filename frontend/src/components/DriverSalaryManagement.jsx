import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaMoneyBillWave, FaHistory, FaInfoCircle, FaUser, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { driverApi } from '../services/api';
const { 
  getSalaryStatus, 
  setSalary: setDriverSalary, 
  adjustSalary: adjustDriverSalary, 
  giveAdvance: giveDriverAdvance, 
  getDriverReport, 
  getAllDrivers,
  formatCurrency,
  formatCycleDates
} = driverApi;

const DriverSalaryManagement = ({ driverId, drivers, onDriverSelect }) => {
  const [activeTab, setActiveTab] = useState('salary'); // 'salary', 'adjust', or 'advance'
  const [selectedDriverId, setSelectedDriverId] = useState(driverId);
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
  });
  const [salaryData, setSalaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [salaryType, setSalaryType] = useState('increase'); // 'increase' or 'decrease' for salary adjustment

  // Fetch salary data when selected driver changes or when manually refreshed
  useEffect(() => {
    if (selectedDriverId) {
      fetchSalaryStatus();
    } else {
      setSalaryData(null);
      setTransactions([]);
    }
  }, [selectedDriverId]);

  const fetchSalaryStatus = async () => {
    if (!selectedDriverId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching salary status for driver:', selectedDriverId);
      
      // Fetch current salary status including cycle information
      const statusResponse = await getSalaryStatus(selectedDriverId).catch(error => {
        console.error('Error in getSalaryStatus:', error);
        throw error;
      });
      
      console.log('Salary status response:', statusResponse?.data);
      
      if (statusResponse?.data) {
        const { currentCycle, salaryHistory } = statusResponse.data;
        
        // Ensure all required fields have default values
        const safeCurrentCycle = {
          cycleNumber: currentCycle.cycleNumber || 1,
          startDate: currentCycle.startDate ? new Date(currentCycle.startDate) : new Date(),
          baseSalary: currentCycle.baseSalary || 0,
          currentAdvances: currentCycle.currentAdvances || 0,
          transactions: Array.isArray(currentCycle.transactions) ? currentCycle.transactions : [],
          ...currentCycle // Spread any additional fields
        };
        
        // Set salary data with cycle information
        setSalaryData({
          currentCycle: {
            ...safeCurrentCycle,
            cycleEnd: currentCycle.cycleEnd ? new Date(currentCycle.cycleEnd) : 
                     new Date(safeCurrentCycle.startDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
            remainingBalance: (safeCurrentCycle.baseSalary || 0) - (safeCurrentCycle.currentAdvances || 0)
          },
          registrationDate: statusResponse.data.registrationDate ? 
                          new Date(statusResponse.data.registrationDate) : new Date()
        });
        
        // Process transactions from all cycles
        const allTransactions = [];
        
        // Add current cycle transactions
        if (safeCurrentCycle.transactions && safeCurrentCycle.transactions.length > 0) {
          allTransactions.push(...safeCurrentCycle.transactions.map(tx => ({
            ...tx,
            cycleNumber: safeCurrentCycle.cycleNumber,
            date: tx.date ? new Date(tx.date) : new Date()
          })));
        }
        
        // Add historical transactions from previous cycles
        if (Array.isArray(salaryHistory)) {
          salaryHistory.forEach(cycle => {
            if (cycle.transactions && cycle.transactions.length > 0) {
              allTransactions.push(...cycle.transactions.map(tx => ({
                ...tx,
                cycleNumber: cycle.cycleNumber || 1,
                date: tx.date ? new Date(tx.date) : new Date()
              })));
            }
          });
        }
        
        console.log('Processed transactions:', allTransactions);
        
        // Sort by date (newest first) and limit to 20 most recent
        setTransactions(
          allTransactions
            .sort((a, b) => b.date - a.date)
            .slice(0, 20)
        );
      }
    } catch (error) {
      toast.error('Failed to fetch salary status');
      console.error('Error fetching salary status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSetSalary = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }
    
    setIsLoading(true);
    try {
      await setDriverSalary(selectedDriverId, { 
        salary: parseFloat(formData.amount),
        note: formData.reason 
      });
      toast.success('Salary set successfully');
      fetchSalaryStatus();
      setFormData({ amount: '', reason: '' });
    } catch (error) {
      console.error('Error setting salary:', error);
      toast.error(error.message || 'Failed to set salary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustSalary = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid adjustment amount');
      return;
    }
    
    setIsLoading(true);
    try {
      await adjustDriverSalary(selectedDriverId, { 
        amount: parseFloat(formData.amount),
        changeType: salaryType,
        note: formData.reason || `Salary ${salaryType}d by ${formData.amount}`
      });
      toast.success(`Salary ${salaryType}d successfully`);
      fetchSalaryStatus();
      setFormData({ amount: '', reason: '' });
    } catch (error) {
      console.error('Error adjusting salary:', error);
      toast.error(error.response?.data?.error || 'Failed to adjust salary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGiveAdvance = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid advance amount');
      return;
    }
    
    setIsLoading(true);
    try {
      await giveDriverAdvance(selectedDriverId, { 
        amount: parseFloat(formData.amount), 
        note: formData.reason || 'Advance payment',
        date: new Date().toISOString()
      });
      toast.success('Advance recorded successfully');
      fetchSalaryStatus();
      setFormData({ amount: '', reason: '' });
    } catch (error) {
      console.error('Error giving advance:', error);
      toast.error(error.response?.data?.error || 'Failed to record advance');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading && !salaryData) {
    return <div className="text-center py-8">Loading salary information...</div>;
  }

  // Handle driver selection
  const handleDriverSelect = (e) => {
    const driverId = e.target.value || null;
    setSelectedDriverId(driverId);
    if (onDriverSelect) {
      onDriverSelect(driverId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with Driver Selection and Cycle Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex-1">
          {salaryData?.currentCycle && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 md:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Current Salary Cycle
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <FaCalendarAlt className="inline mr-1" />
                    {formatCycleDates(
                      salaryData.currentCycle.startDate,
                      salaryData.currentCycle.cycleEnd
                    )}
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Cycle #{salaryData.currentCycle.cycleNumber}
                    </span>
                  </p>
                </div>
                <button 
                  onClick={fetchSalaryStatus}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  disabled={isLoading}
                  title="Refresh"
                >
                  <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Driver Selection */}
        <div className="w-full md:w-80">
          <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Driver
          </label>
          <select
            id="driver-select"
            value={selectedDriverId || ''}
            onChange={handleDriverSelect}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isLoading}
          >
            <option value="">-- Select a driver --</option>
            {drivers && drivers.map(driver => (
              <option key={driver._id} value={driver._id}>
                {driver.fullName} ({driver.phoneNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDriverId ? (
        <>
          {/* Salary Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm flex items-center">
                <FaRupeeSign className="mr-1 text-blue-600" /> Base Salary
              </h3>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {salaryData?.currentCycle ? formatCurrency(salaryData.currentCycle.baseSalary) : 'N/A'}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm flex items-center">
                <FaMoneyBillWave className="mr-1 text-yellow-600" /> Total Advances
              </h3>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {salaryData?.currentCycle ? formatCurrency(salaryData.currentCycle.currentAdvances) : 'N/A'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm flex items-center">
                <FaRupeeSign className="mr-1 text-green-600" /> Remaining Balance
              </h3>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {salaryData?.currentCycle ? formatCurrency(
                  Math.max(0, salaryData.currentCycle.baseSalary - salaryData.currentCycle.currentAdvances)
                ) : 'N/A'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm flex items-center">
                <FaCalendarAlt className="mr-1 text-purple-600" /> Cycle Ends In
              </h3>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {salaryData?.currentCycle ? (
                  `${Math.max(0, Math.ceil(
                    (salaryData.currentCycle.cycleEnd - new Date()) / (1000 * 60 * 60 * 24)
                  ))} days`
                ) : 'N/A'}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm">Total Advance</h3>
              <p className="text-2xl font-bold text-yellow-700">
                {salaryData ? formatCurrency(salaryData.totalAdvance) : 'N/A'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-gray-600 text-sm">Remaining Salary</h3>
              <p className="text-2xl font-bold text-green-700">
                {salaryData ? formatCurrency(salaryData.remainingSalary) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b">
            <button
              type="button"
              className={`py-2 px-4 ${activeTab === 'salary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('salary')}
            >
              Set Salary
            </button>
            <button
              type="button"
              className={`py-2 px-4 ${activeTab === 'adjust' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('adjust')}
            >
              Adjust Salary
            </button>
            <button
              type="button"
              className={`py-2 px-4 ${activeTab === 'advance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('advance')}
            >
              Give Advance
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No driver selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a driver to view and manage their salary details.
          </p>
        </div>
      )}

      {selectedDriverId && (
        <div className="mt-6">
          {/* Tab Content */}
          <div className="mt-6">
            {/* Set Salary Form */}
            {activeTab === 'salary' && (
              <form onSubmit={handleSetSalary} className="space-y-4 p-4 bg-white rounded-lg shadow">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter monthly salary"
                    required
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Reason for setting this salary"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isLoading || !formData.amount}
                >
                  {isLoading ? 'Saving...' : 'Set Salary'}
                </button>
              </form>
            )}

            {/* Adjust Salary Form */}
            {activeTab === 'adjust' && (
              <form onSubmit={handleAdjustSalary} className="space-y-4 p-4 bg-white rounded-lg shadow">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                  <select
                    value={salaryType}
                    onChange={(e) => setSalaryType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="increase">Increase Salary</option>
                    <option value="decrease">Decrease Salary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {salaryType === 'increase' ? 'Increase' : 'Decrease'} Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder={`Enter amount to ${salaryType}`}
                    required
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder={`Reason for ${salaryType}ing salary`}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  type="submit" 
                  className={`w-full py-2 px-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    salaryType === 'increase' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading || !formData.amount}
                >
                  {isLoading ? 'Processing...' : `${salaryType === 'increase' ? 'Increase' : 'Decrease'} Salary`}
                </button>
              </form>
            )}

            {/* Give Advance Form */}
            {activeTab === 'advance' && (
              <form onSubmit={handleGiveAdvance} className="space-y-4 p-4 bg-white rounded-lg shadow">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Advance Amount (₹)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Advance (Optional)
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason for advance payment"
                    rows="3"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be recorded in the transaction history.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.amount}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isLoading || !formData.amount
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Record Advance Payment'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
          {isLoading && !transactions.length ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => {
                    const isCredit = ['salary', 'adjustment'].includes(tx.type) && 
                                  (tx.amount > 0 || tx.changeType === 'increase');
                    const isDebit = tx.type === 'advance' || 
                                  (tx.type === 'adjustment' && tx.changeType === 'decrease');
                    
                    return (
                      <li key={index}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mt-1 ${
                                isCredit ? 'bg-green-100 text-green-600' : 
                                isDebit ? 'bg-yellow-100 text-yellow-600' : 
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {tx.type === 'salary' ? (
                                  <FaRupeeSign />
                                ) : tx.type === 'advance' ? (
                                  <FaMoneyBillWave />
                                ) : (
                                  <FaInfoCircle />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {tx.type === 'salary' ? 'Salary' : 
                                   tx.type === 'advance' ? 'Advance' : 
                                   tx.type === 'adjustment' ? 'Salary Adjustment' : 'Transaction'}
                                </p>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>
                                    {tx.date.toLocaleDateString()}
                                    <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                                      Cycle #{tx.cycleNumber}
                                    </span>
                                  </p>
                                  {tx.note && (
                                    <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                                      {tx.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={`text-right ${isCredit ? 'text-green-600' : 'text-yellow-600'}`}>
                              <p className="text-sm font-semibold">
                                {isCredit ? '+' : ''}
                                {isDebit ? '-' : ''}
                                {formatCurrency(Math.abs(tx.amount))}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {tx.type === 'adjustment' && (
                                  <span className="block capitalize">{tx.changeType}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-4 py-6 text-center text-gray-500">
                    No transactions found for this cycle
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedDriverId ? 'No transactions found for this driver.' : 'Select a driver to view transactions.'}
              </p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSalaryManagement;
