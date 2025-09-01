"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const user_management_1 = require("@zcatalyst/user-management");
class NotificationService {
    constructor() {
        this.scheduledJobs = new Map();
        this.db = database_1.Database.getInstance();
        this.initializeEmailService();
        this.initializeSMSService();
        this.scheduleNotifications();
    }
    initializeEmailService() {
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    initializeSMSService() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
    async sendEmailNotification(user, notification) {
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
        }
        catch (error) {
            console.error('Email notification failed:', error);
            return false;
        }
    }
    async sendSMSNotification(user, notification) {
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
        }
        catch (error) {
            console.error('SMS notification failed:', error);
            return false;
        }
    }
    scheduleNotifications() {
        // Check for notifications every minute
        node_cron_1.default.schedule('* * * * *', () => {
            this.checkAndSendNotifications();
        });
    }
    async checkAndSendNotifications() {
        const userManagement = new user_management_1.UserManagement();
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        // Get all enabled notifications
        const allNotifications = Array.from(this.db.notifications.values())
            .filter(notification => notification.enabled && notification.scheduledTime === currentTime);
        for (const notification of allNotifications) {
            const user = await userManagement.getUserDetails(notification.userId);
            if (!user)
                continue;
            // Check if we already sent this notification today
            const today = now.toISOString().split('T')[0];
            const lastSentDate = notification.lastSent?.toISOString().split('T')[0];
            if (lastSentDate === today)
                continue;
            // Send notifications
            const emailSent = await this.sendEmailNotification(user, notification);
            const smsSent = await this.sendSMSNotification(user, notification);
            if (emailSent || smsSent) {
                // Update last sent timestamp
                this.db.updateNotification(notification.id, { lastSent: now });
            }
        }
    }
    createUserNotifications(userId) {
        const defaultNotifications = [
            {
                userId,
                type: 'meal',
                title: 'Breakfast Time',
                message: 'Time for your healthy breakfast!',
                scheduledTime: '07:30',
                enabled: true,
                // id: ''
            },
            {
                userId,
                type: 'meal',
                title: 'Lunch Reminder',
                message: 'Don\'t forget your balanced lunch',
                scheduledTime: '12:30',
                enabled: true,
                // id: ''
            },
            {
                userId,
                type: 'meal',
                title: 'Dinner Time',
                message: 'Time for a nutritious dinner',
                scheduledTime: '18:30',
                enabled: true,
                id: ''
            },
            {
                userId,
                type: 'exercise',
                title: 'Workout Reminder',
                message: 'Time for your daily exercise routine',
                scheduledTime: '16:00',
                enabled: true,
                // id: ''
            },
            {
                userId,
                type: 'weight-check',
                title: 'Weight Check',
                message: 'Time to track your progress',
                scheduledTime: '07:00',
                enabled: false,
                // id: ''
            },
            {
                userId,
                type: 'health-check',
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
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map