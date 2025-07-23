"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
// Get user notifications
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const notifications = db.getNotificationsByUserId(req.user.userId);
        res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update notification
router.put('/:id', auth_1.authenticateToken, (req, res) => {
    try {
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
router.patch('/:id/toggle', auth_1.authenticateToken, (req, res) => {
    try {
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