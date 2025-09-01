import express from 'express';
import { Database } from '../config/database';

const router = express.Router();
// Load environment variables

// Get user notifications
router.get('/', (req: any, res) => {
  try {
    const db = Database.getInstance();
    const notifications = db.getNotificationsByUserId(req.params.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification
router.put('/:id', (req: any, res) => {
  try {
    const db = Database.getInstance();
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
router.patch('/:id/toggle', (req: any, res) => {
  try {
    const db = Database.getInstance();
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