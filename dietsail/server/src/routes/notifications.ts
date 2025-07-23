import express from 'express';
import { Database } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const db = Database.getInstance();

// Get user notifications
router.get('/', authenticateToken, (req: any, res) => {
  try {
    const notifications = db.getNotificationsByUserId(req.user.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification
router.put('/:id', authenticateToken, (req: any, res) => {
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
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle notification
router.patch('/:id/toggle', authenticateToken, (req: any, res) => {
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
  } catch (error) {
    console.error('Toggle notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;