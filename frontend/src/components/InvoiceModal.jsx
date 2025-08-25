import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FaTimes, FaDownload, FaPrint, FaFileInvoice } from 'react-icons/fa';
import SignaturePad from './SignaturePad';
import api from '../services/api';
import '../styles/print.css';

const InvoiceModal = ({ booking, onClose }) => {
  const [signature, setSignature] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const invoiceRef = useRef();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${parseFloat(amount).toFixed(2)}` : '₹0.00';
  };

  const handleSignatureSave = (signatureData) => {
    setSignature(signatureData);
  };

  const handleDownloadPDF = async () => {
    if (!signature) {
      setError('Please provide a signature before downloading');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Get the HTML content of the invoice
      const invoiceHtml = invoiceRef.current.outerHTML;
      
      // Send to backend to generate PDF
      const response = await api.post('/invoices/generate-pdf', {
        invoiceHtml,
        bookingId: booking._id,
        signatureData: signature
      }, { responseType: 'blob' });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${booking.bookingId || booking._id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderInvoice = () => (
    <div ref={invoiceRef} id="invoice-print" className="p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600">#{booking.bookingId || booking._id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-700 font-medium">Cab Service</p>
          <p className="text-sm text-gray-600">123 Cab Street</p>
          <p className="text-sm text-gray-600">Mumbai, 400001</p>
          <p className="text-sm text-gray-600">GST: 22AAAAA0000A1Z5</p>
        </div>
      </div>

      {/* Customer & Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-2">Bill To</h3>
          <p className="font-medium">{booking.customer?.name || 'Customer Name'}</p>
          <p className="text-gray-600">{booking.customer?.phone || 'N/A'}</p>
        </div>
        <div className="text-right md:text-left">
          <h3 className="text-lg font-semibold border-b pb-2 mb-2">Trip Details</h3>
          <p><span className="font-medium">Date:</span> {formatDate(booking.createdAt)}</p>
          <p><span className="font-medium">Vehicle:</span> {booking.vehicleId?.model || 'N/A'}</p>
          <p><span className="font-medium">Driver:</span> {booking.driverId?.name || 'N/A'}</p>
        </div>
      </div>

      {/* Trip Route */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <p className="font-medium">Pickup:</p>
          <p className="ml-2">{booking.pickupLocation?.address || 'N/A'}</p>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <p className="font-medium">Drop-off:</p>
          <p className="ml-2">{booking.dropoffLocation?.address || 'N/A'}</p>
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Fare Details</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Base Fare</p>
            <p className="font-medium">{formatCurrency(booking.fare?.baseFare)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Distance</p>
            <p className="font-medium">{booking.distance || 0} km</p>
          </div>
          <div>
            <p className="text-gray-600">Distance Fare</p>
            <p className="font-medium">{formatCurrency(booking.fare?.distanceFare)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Duration</p>
            <p className="font-medium">{booking.duration || 0} mins</p>
          </div>
          {booking.fare?.waitingCharges > 0 && (
            <div>
              <p className="text-gray-600">Waiting Charges</p>
              <p className="font-medium">{formatCurrency(booking.fare.waitingCharges)}</p>
            </div>
          )}
          {booking.fare?.tollCharges > 0 && (
            <div className="text-right">
              <p className="text-gray-600">Toll/Parking</p>
              <p className="font-medium">{formatCurrency(booking.fare.tollCharges)}</p>
            </div>
          )}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total Amount</span>
            <span>{formatCurrency(booking.fare?.total || booking.fare)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12">
        <div className="flex justify-between items-end">
          <div>
            <div className="border-t-2 border-gray-400 w-32 mb-2"></div>
            <p className="text-sm text-gray-600">Authorized Signature</p>
          </div>
          <div>
            <div className="border-t-2 border-gray-400 w-32 mb-2"></div>
            <p className="text-sm text-gray-600">Customer Signature</p>
            {signature && (
              <img 
                src={signature} 
                alt="Customer Signature" 
                className="h-12 mt-2 border border-gray-300"
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
        <p>Thank you for choosing our services!</p>
        <p className="mt-1">For any queries, contact: support@cabservice.com | +91 98765 43210</p>
      </div>
    </div>
  );

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8 relative print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold flex items-center">
            <FaFileInvoice className="mr-2 text-blue-600" />
            Invoice #{booking.bookingId || booking._id.slice(-6).toUpperCase()}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-blue-600 no-print"
              title="Print Invoice"
            >
              <FaPrint size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 no-print"
              title="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-4">
          {/* Preview */}
          <div className="mb-6 border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-medium">Invoice Preview</h3>
            </div>
            <div className="overflow-auto max-h-[60vh] p-4">
              {renderInvoice()}
            </div>
          </div>

          {/* Signature Pad */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Customer Signature</h3>
            <SignaturePad onSave={handleSignatureSave} />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t no-print">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!signature || isGenerating}
              className={`px-6 py-2 rounded-md text-white flex items-center ${
                !signature || isGenerating
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
