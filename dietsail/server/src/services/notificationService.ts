import nodemailer from 'nodemailer';
import twilio from 'twilio';
import cron from 'node-cron';
import { Database } from '../config/database';
import { Notification } from '../types';
import { UserManagement } from '@zcatalyst/user-management';

export class NotificationService {
  private db: Database;
  private emailTransporter?: nodemailer.Transporter;
  private twilioClient: any;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.db = Database.getInstance();
    this.initializeEmailService();
    this.initializeSMSService();
    this.scheduleNotifications();
  }

  private initializeEmailService() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  private initializeSMSService() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  public async sendEmailNotification(user: Record<string, any>, notification: Notification): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `NutriAI: ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🍎 NutriAI</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">${notification.title}</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${notification.message}</p>
              <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  This is an automated reminder from your NutriAI app. Stay on track with your health goals!
                </p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; background: #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>© 2025 NutriAI. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await this.emailTransporter?.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  public async sendSMSNotification(user: Record<string, any>, notification: Notification): Promise<boolean> {
    if (!this.twilioClient || !user.phone) {
      return false;
    }

    try {
      await this.twilioClient.messages.create({
        body: `🍎 NutriAI: ${notification.title} - ${notification.message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });
      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  public scheduleNotifications() {
    // Check for notifications every minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendNotifications();
    });
  }

  private async checkAndSendNotifications() {
    const userManagement = new UserManagement();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Get all enabled notifications
    const allNotifications = Array.from(this.db.notifications.values())
      .filter(notification => notification.enabled && notification.scheduledTime === currentTime);

    for (const notification of allNotifications) {
      const user = await userManagement.getUserDetails(notification.userId);
      if (!user) continue;

      // Check if we already sent this notification today
      const today = now.toISOString().split('T')[0];
      const lastSentDate = notification.lastSent?.toISOString().split('T')[0];
      
      if (lastSentDate === today) continue;

      // Send notifications
      const emailSent = await this.sendEmailNotification(user, notification);
      const smsSent = await this.sendSMSNotification(user, notification);

      if (emailSent || smsSent) {
        // Update last sent timestamp
        this.db.updateNotification(notification.id, { lastSent: now });
      }
    }
  }

  public createUserNotifications(userId: string): Notification[] {
    const defaultNotifications = [
      {
        userId,
        type: 'meal' as const,
        title: 'Breakfast Time',
        message: 'Time for your healthy breakfast!',
        scheduledTime: '07:30',
        enabled: true,
        // id: ''
      },
      {
        userId,
        type: 'meal' as const,
        title: 'Lunch Reminder',
        message: 'Don\'t forget your balanced lunch',
        scheduledTime: '12:30',
        enabled: true,
        // id: ''
      },
      {
        userId,
        type: 'meal' as const,
        title: 'Dinner Time',
        message: 'Time for a nutritious dinner',
        scheduledTime: '18:30',
        enabled: true,
        id: ''
      },
      {
        userId,
        type: 'exercise' as const,
        title: 'Workout Reminder',
        message: 'Time for your daily exercise routine',
        scheduledTime: '16:00',
        enabled: true,
        // id: ''
      },
      {
        userId,
        type: 'weight-check' as const,
        title: 'Weight Check',
        message: 'Time to track your progress',
        scheduledTime: '07:00',
        enabled: false,
        // id: ''
      },
      {
        userId,
        type: 'health-check' as const,
        title: 'Health Metrics',
        message: 'Record your daily health metrics',
        scheduledTime: '21:00',
        enabled: true,
        // id: ''
      }
    ];

    return defaultNotifications.map(notif => this.db.createNotification(notif));
  }
}