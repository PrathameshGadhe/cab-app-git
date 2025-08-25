const Notification = require('../models/Notification');
const Driver = require('../models/Driver');
const user = require('../models/User');

const getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        // ✅ Fetch and attach full driver info to each notification
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notification) => {
                if (notification.driverId) {
                    const driver = await Driver.findById(notification.driverId).select(
                        'fullName phoneNumber email gender vehicleNumber vehicleType licenseImage aadhaarCardImage totalRides'
                    );
                    return {
                        ...notification.toObject(),
                        driver: driver || null,
                    };
                } else {
                    return notification;
                }
            })
        );

        res.status(200).json(enrichedNotifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const updated = await Notification.findByIdAndUpdate(notificationId, {
            isRead: true,
        });

        if (!updated) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
};
