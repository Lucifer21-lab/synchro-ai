const Notification = require('../models/Notification');
const { ApiError } = require('../utils/apiResponse');

class NotificationService {
    constructor() {
        this.io = null;
    };

    init(ioInstance) {
        this.io = ioInstance;
    };

    async notify({ recipient, sender, message, type }) {
        try {
            // save to daatabase for persistence
            const notification = await Notification.create({
                recipient,
                sender,
                message,
                type
            });

            // populate sender details for the frontend ui
            const populatedNotify = await notification.populate('sender', 'name avatar');

            // emit real time event if socket is initialized
            if (this.io) {
                this.io.to(recipient.toString()).emit('new-notification', populatedNotify);
            }

            return populatedNotify;
        } catch (error) {
            console.error('Notification Service Error', error);
            return null;
        }
    };

    async notifyTaskAssignment(recipientId, senderId, taskTitle) {
        try {
            return this.notify({
                recipient: recipientId,
                sender: senderId,
                message: `You have been assigned a new task ${taskTitle}`,
                type: 'Task'
            });
        } catch (error) {
            console.error("Error while notifying the task assignment :", error);
        }
    };

    async notifyMerge(recipientId, senderId, taskTitle) {
        return this.notify({
            recipient: recipientId,
            sender: senderId,
            message: `Your work for "${taskTitle}" has been merged`,
            type: 'Merge'
        });
    };
}

module.exports = new NotificationService();