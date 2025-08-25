const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const Booking = require('../models/booking');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Helper function to convert number to words
const numberToWords = (num) => {
  if (isNaN(num)) return '';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertTens = (num) => {
    if (num < 10) return single[num];
    if (num < 20) return double[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + single[num % 10] : '');
  };
  
  const convertHundreds = (num) => {
    if (num > 99) {
      return single[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + convertTens(num % 100) : '');
    }
    return convertTens(num);
  };
  
  const numStr = Math.floor(num).toString();
  if (num === 0) return 'Zero';
  
  // For numbers less than 1000
  if (num < 1000) return convertHundreds(num);
  
  // For numbers between 1000 and 999999
  if (num < 1000000) {
    return (
      convertHundreds(Math.floor(num / 1000)) +
      ' Thousand' +
      (num % 1000 ? ' ' + convertHundreds(num % 1000) : '')
    );
  }
  
  // For numbers between 1000000 and 999999999
  if (num < 1000000000) {
    return (
      convertHundreds(Math.floor(num / 1000000)) +
      ' Million' +
      (num % 1000000 ? ' ' + numberToWords(num % 1000000) : '')
    );
  }
  
  // For numbers 1000000000 and above
  return (
    convertHundreds(Math.floor(num / 1000000000)) +
    ' Billion' +
    (num % 1000000000 ? ' ' + numberToWords(num % 1000000000) : '')
  );
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${ampm}`;
  } catch (e) {
    return timeString;
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { bookingId, signatureData } = req.body;
    
    // Find the booking with all necessary data populated
    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'userId',
        select: 'name email phone',
        model: 'User'
      })
      .populate({
        path: 'assignedDriver',
        select: 'fullName phoneNumber vehicleNumber',
        model: 'Driver'
      })
      .populate({
        path: 'companyId',
        select: 'companyName companyId',
        model: 'Company'
      })
      .populate({
        path: 'vehicleId',
        select: 'vehicleNumber model type',
        model: 'Vehicle'
      })
      .populate({
        path: 'driverId',
        select: 'fullName phoneNumber',
        model: 'Driver'
      })
      .lean();
      
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    // Ensure all required fields have default values
    booking.fare = booking.fare || 0;
    booking.distance = booking.distance || 0;
    booking.duration = booking.duration || 1;
    booking.passengers = booking.passengers || 1;
    booking.cabType = booking.cabType || 'Sedan';
    booking.tripType = booking.tripType || 'local';

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    // Set up the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${bookingId}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc
      .fontSize(20)
      .text('TAX INVOICE', { align: 'center', underline: true })
      .moveDown(0.5);

    // Add invoice details
    doc
      .fontSize(10)
      .text(`Invoice #: INV-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${bookingId.toString().slice(-4).toUpperCase()}`, { align: 'right' })
      .text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { align: 'right' })
      .moveDown(1);

    // Add company and customer details side by side
    const startY = doc.y;
    
    // Company details (left side)
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('From:', 50, startY)
      .font('Helvetica')
      .text('Omshanti Cab Services', 50, startY + 20)
      .text('123 Cab Street, Mumbai - 400001')
      .text(`GST: ${process.env.COMPANY_GST || '22AAAAA0000A1Z5'}`)
      .text(`Phone: ${process.env.COMPANY_PHONE || '+91 98765 43210'}`)
      .text(`Email: ${process.env.COMPANY_EMAIL || 'bookings@omshanticab.com'}`);
    
    // Customer details (right side)
    const customer = booking.userId || {};
    doc
      .font('Helvetica-Bold')
      .text('Bill To:', 300, startY)
      .font('Helvetica')
      .text(customer.name || 'Guest User', 300, startY + 20)
      .text(`Phone: ${customer.phone || 'N/A'}`)
      .text(`Email: ${customer.email || 'N/A'}`);
    
    // Reset Y position to the bottom of the tallest column
    doc.y = Math.max(doc.y, startY + 80);
    doc.moveDown(1);

    // Add a line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Add booking summary
    doc.fontSize(14).text('Trip Summary', { underline: true });
    doc.moveDown(0.5);
    
    // Format driver information
    const driverName = booking.assignedDriver?.fullName || 'Not Assigned';
    const driverPhone = booking.assignedDriver?.phoneNumber || 'N/A';
    const vehicleNumber = booking.assignedDriver?.vehicleNumber || booking.vehicleNumber || 'N/A';
    
    // Format company information
    const companyName = booking.companyId?.companyName || 'Omshanti Cab Services';
    
    // Trip details in a clean format
    const tripDetails = [
      { label: 'Pickup Location', value: booking.pickup || 'N/A' },
      { label: 'Dropoff Location', value: booking.dropoff || 'N/A' },
      { 
        label: 'Trip Date', 
        value: booking.date 
          ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : formatDate(booking.createdAt) 
      },
      { 
        label: 'Pickup Time', 
        value: formatTime(booking.time) 
      },
      { 
        label: 'Vehicle', 
        value: booking.cabType ? `${booking.cabType} (${vehicleNumber})` : 'N/A' 
      },
      { 
        label: 'Trip Type', 
        value: booking.tripType 
          ? booking.tripType.charAt(0).toUpperCase() + booking.tripType.slice(1)
          : 'N/A' 
      },
      { 
        label: 'Distance/Duration', 
        value: `${booking.distance || 0} km / ${booking.duration || 0} hours` 
      },
      { 
        label: 'Passengers', 
        value: booking.passengers || 'N/A' 
      },
      { 
        label: 'Driver', 
        value: driverName === 'Not Assigned' ? 'Not Assigned' : `${driverName} (${driverPhone})` 
      }
    ];
    
    // Remove company details from the main details if it's the default company
    if (companyName !== 'Omshanti Cab Services') {
      tripDetails.push({
        label: 'Company',
        value: companyName
      });
    }
    
    // Add trip details in two columns
    const col1X = 50;
    const col2X = 300;
    let currentY = doc.y;
    
    tripDetails.forEach((detail, index) => {
      const y = currentY + (index % 10) * 20;
      const isSecondColumn = index >= Math.ceil(tripDetails.length / 2) && index < tripDetails.length - 1;
      
      doc
        .font('Helvetica-Bold')
        .text(`${detail.label}:`, isSecondColumn ? col2X : col1X, y)
        .font('Helvetica')
        .text(detail.value, (isSecondColumn ? col2X : col1X) + 100, y);
    });
    
    // Adjust Y position after trip details
    doc.y = currentY + (Math.ceil(tripDetails.length / 2) * 20) + 20;
    doc.moveDown(1);
    
    // Add fare breakdown
    doc.fontSize(14).text('Fare Breakdown', { underline: true });
    doc.moveDown(0.5);
    
    // Fare details table
    const tableTop = doc.y;
    const descriptionX = 50;
    const amountX = 500;

    // Table header
    doc.font('Helvetica-Bold');
    doc.fontSize(10).text('Description', itemCodeX, tableTop);
    doc.text('Details', descriptionX, tableTop);
    doc.text('Amount', amountX, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Table header
    doc.font('Helvetica-Bold');
    doc.text('Description', descriptionX, tableTop);
    doc.text('Amount', amountX, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica');
    
    // Helper function to add table rows
    const addRow = (description, value, isBold = false, yOffset = 0) => {
      if (isBold) doc.font('Helvetica-Bold');
      const y = doc.y + yOffset;
      doc.text(description, descriptionX, y);
      doc.text(formatCurrency(value), amountX, y, { width: 100, align: 'right' });
      if (isBold) doc.font('Helvetica');
      doc.moveDown(0.5);
      return y;
    };
    
    // Add fare components
    addRow('Base Fare', booking.fare || 0);
    
    // Add any additional charges if available in booking
    if (booking.tollCharges) addRow('Toll/Parking Charges', booking.tollCharges);
    if (booking.nightCharges) addRow('Night Charges', booking.nightCharges);
    if (booking.peakCharges) addRow('Peak Time Charges', booking.peakCharges);
    
    // Add any other charges from metadata if available
    if (booking.metadata?.additionalCharges) {
      booking.metadata.additionalCharges.forEach(charge => {
        addRow(charge.description, charge.amount);
      });
    }
    
    // Calculate GST (18% of subtotal)
    const gstRate = 0.18;
    const subtotal = booking.fare + 
      (booking.tollCharges || 0) + 
      (booking.nightCharges || 0) + 
      (booking.peakCharges || 0) +
      ((booking.metadata?.additionalCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0));
      
    const gstAmount = subtotal * gstRate;
    
    addRow('Subtotal', subtotal);
    addRow(`GST (${gstRate * 100}%)`, gstAmount);

    // Add total
    const totalAmount = subtotal + gstAmount;
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    addRow('Total Amount', totalAmount, true);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    
    // Add amount in words
    doc.fontSize(10);
    doc.text(`Amount in words: ${numberToWords(totalAmount)} Rupees Only`, 50, doc.y + 10);
    doc.moveDown(2);

    // Add signature area
    doc.moveDown(2);
    
    // Company signature
    doc.text('For Omshanti Cab Services', 50, doc.y);
    doc.moveTo(50, doc.y + 20).lineTo(200, doc.y + 20).stroke();
    doc.text('Authorized Signatory', 50, doc.y + 25);
    
    // Add customer signature if available
    if (signatureData) {
      doc.text('Customer Signature:', 350, doc.y - 25);
      
      // Convert base64 signature to image and add to PDF
      try {
        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        // Add the image to the PDF
        doc.image(imgBuffer, 350, doc.y, { width: 150, height: 40 });
        doc.moveTo(350, doc.y + 50).lineTo(500, doc.y + 50).stroke();
        doc.text('Signature', 350, doc.y + 55);
      } catch (err) {
        console.error('Error adding signature to PDF:', err);
        doc.text('Signature not available', 350, doc.y);
      }
    }

    // Add footer with terms and conditions
    const footerY = 750;
    doc
      .fontSize(8)
      .text(
        'Thank you for choosing our services! For any queries, please contact us at:',
        50,
        footerY,
        { align: 'center', width: 500 }
      )
      .text(
        `${process.env.COMPANY_EMAIL || 'support@omshanticab.com'} | ${process.env.COMPANY_PHONE || '+91 98765 43210'}`,
        50,
        footerY + 12,
        { align: 'center', width: 500 }
      )
      .text(
        'This is a computer-generated invoice. No signature required.',
        50,
        footerY + 24,
        { align: 'center', width: 500, font: 'Helvetica-Oblique' }
      );
      
    // Add page number if needed
    const pageNumber = doc.bufferedPageRange().count;
    doc.text(
      `Page ${pageNumber}`,
      doc.page.width - 50,
      doc.page.height - 30,
      { align: 'right' }
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};
