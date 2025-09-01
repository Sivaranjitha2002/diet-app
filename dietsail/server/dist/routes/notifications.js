"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Load environment variables
// Get user notifications
router.get('/', (req, res) => {
    try {
        const db = database_1.Database.getInstance();
        const notifications = db.getNotificationsByUserId(req.params.userId);
        res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update notification
router.put('/:id', (req, res) => {
    try {
        const db = database_1.Database.getInstance();
        const notification = db.notifications.get(req.params.id);
        if (!notification || notification.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updatedNotification = db.updateNotification(req.params.id, req.body);
        res.json({
            message: 'Notification updated successfully',
            notification: updatedNotification
        });
    }
    catch (error) {
        console.error('Update notification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Toggle notification
router.patch('/:id/toggle', (req, res) => {
    try {
        const db = database_1.Database.getInstance();
        const notification = db.notifications.get(req.params.id);
        if (!notification || notification.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updatedNotification = db.updateNotification(req.params.id, {
            enabled: !notification.enabled
        });
        res.json({
            message: 'Notification toggled successfully',
            notification: updatedNotification
        });
    }
    catch (error) {
        console.error('Toggle notification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map