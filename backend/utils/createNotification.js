// utils/createNotification.js
const Notification = require('../models/Notification');

const createNotification = async (userId, message, bookingId, driverId = null) => {
    try {
      return await Notification.create({
        userId,
        bookingId,
        driverId,
        message,
        isRead: false,
      });
    } catch (error) {
      console.error('Notification creation failed:', error);
      throw error;
    }
  };
  

module.exports = createNotification;