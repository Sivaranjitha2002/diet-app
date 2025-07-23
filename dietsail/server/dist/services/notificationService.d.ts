import { Notification, User } from '../types';
export declare class NotificationService {
    private db;
    private emailTransporter?;
    private twilioClient;
    private scheduledJobs;
    constructor();
    private initializeEmailService;
    private initializeSMSService;
    sendEmailNotification(user: User, notification: Notification): Promise<boolean>;
    sendSMSNotification(user: User, notification: Notification): Promise<boolean>;
    scheduleNotifications(): void;
    private checkAndSendNotifications;
    createUserNotifications(userId: string): Notification[];
}
//# sourceMappingURL=notificationService.d.ts.map