"use strict";
// In-memory database simulation
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const datastore_1 = require("@zcatalyst/datastore");
const zcql_1 = require("@zcatalyst/zcql");
const push_notification_1 = require("@zcatalyst/push-notification");
class Database {
    constructor() {
        this.users = new Map();
        this.foods = new Map();
        this.meals = new Map();
        this.dietPlans = new Map();
        this.notifications = new Map();
        this.progressEntries = new Map();
        this.aiRecommendations = new Map();
        this.pushNotification = new push_notification_1.PushNotification();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    // User operations
    createUser(user) {
        const newUser = {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(newUser.id, newUser);
        return newUser;
    }
    updateUser(id, updates) {
        const user = this.users.get(id);
        if (user) {
            const updatedUser = { ...user, ...updates, updatedAt: new Date() };
            this.users.set(id, updatedUser);
            return updatedUser;
        }
        return undefined;
    }
    // Food operations
    async getAllFoods() {
        const zcql = new zcql_1.ZCQL();
        let table = await zcql.executeZCQLQuery('select * from foods');
        table = table.map(tables => (tables.foods));
        return table;
    }
    getFoodById(id) {
        return this.foods.get(id);
    }
    searchFoods(query) {
        const foods = Array.from(this.foods.values());
        return foods.filter(food => food.name.toLowerCase().includes(query.toLowerCase()) ||
            food.category.toLowerCase().includes(query.toLowerCase()));
    }
    // Meal operations
    async createMeal(meal) {
        const datastore = new datastore_1.Datastore();
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        const newMeal = {
            ...meal,
            id: Date.now().toString(),
            createdAt: formattedDate
        };
        const response = await datastore.table('30268000000048631').insertRow(newMeal);
        return response;
    }
    async getMealsByUserId(userId) {
        const zcql = new zcql_1.ZCQL();
        console.log('Fetching meals for user:', userId);
        if (!userId)
            return [];
        const meals = await zcql.executeZCQLQuery(`select * from meals where userId='${userId}' and completed='false'`);
        return meals;
    }
    async getMealsByUserAndDate(userId, date) {
        const zcql = new zcql_1.ZCQL();
        console.log('Fetching meals for user:', userId, 'on date:', date);
        if (!userId)
            return [];
        const meals = await zcql.executeZCQLQuery(`select * from meals where userId='${userId}' and createdAt='${date}' and completed='false'`);
        return meals;
    }
    async updateMeal(id, updates) {
        const datastore = new datastore_1.Datastore();
        const newMeal = {
            ...updates,
            ROWID: id,
        };
        const response = await datastore.table('30268000000048631').updateRow(newMeal);
        return response;
    }
    // Notification operations
    createNotification(notification) {
        const newNotification = {
            ...notification,
            id: Date.now().toString()
        };
        this.notifications.set(newNotification.id, newNotification);
        return newNotification;
    }
    getNotificationsByUserId(userId) {
        return Array.from(this.notifications.values()).filter(notification => notification.userId === userId);
    }
    updateNotification(id, updates) {
        const notification = this.notifications.get(id);
        if (notification) {
            const updatedNotification = { ...notification, ...updates };
            this.notifications.set(id, updatedNotification);
            return updatedNotification;
        }
        return undefined;
    }
    // Progress operations
    createProgressEntry(entry) {
        const newEntry = {
            ...entry,
            id: Date.now().toString()
        };
        this.progressEntries.set(newEntry.id, newEntry);
        return newEntry;
    }
    getProgressByUserId(userId) {
        return Array.from(this.progressEntries.values()).filter(entry => entry.userId === userId);
    }
    // Push Notification operations
    async registerDeviceToken(userId, deviceToken, platform) {
        try {
            const datastore = new datastore_1.Datastore();
            // Check if device token already exists for user
            const zcql = new zcql_1.ZCQL();
            const existingTokens = await zcql.executeZCQLQuery(`select * from device_tokens where userId='${userId}' and deviceToken='${deviceToken}'`);
            if (existingTokens.length === 0) {
                // Insert new device token
                await datastore.table('device_tokens').insertRow({
                    userId,
                    deviceToken,
                    platform,
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
            }
            else {
                // Update existing token to active
                await datastore.table('device_tokens').updateRow({
                    ROWID: existingTokens[0].ROWID,
                    isActive: true,
                    updatedAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            console.error('Error registering device token:', error);
            throw error;
        }
    }
    async removeDeviceToken(userId, deviceToken) {
        try {
            const zcql = new zcql_1.ZCQL();
            const existingTokens = await zcql.executeZCQLQuery(`select * from device_tokens where userId='${userId}' and deviceToken='${deviceToken}'`);
            if (existingTokens.length > 0) {
                const datastore = new datastore_1.Datastore();
                await datastore.table('device_tokens').updateRow({
                    ROWID: existingTokens[0].ROWID,
                    isActive: false,
                    updatedAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            console.error('Error removing device token:', error);
            throw error;
        }
    }
    async getUserDeviceTokens(userId) {
        try {
            const zcql = new zcql_1.ZCQL();
            const tokens = await zcql.executeZCQLQuery(`select deviceToken from device_tokens where userId='${userId}' and isActive=true`);
            return tokens.map((token) => token.device_tokens.deviceToken);
        }
        catch (error) {
            console.error('Error fetching device tokens:', error);
            return [];
        }
    }
    async sendPushNotification(userId, title, message, data) {
        try {
            const deviceTokens = await this.getUserDeviceTokens(userId);
            if (deviceTokens.length === 0) {
                console.log(`No active device tokens found for user: ${userId}`);
                return;
            }
            const notificationPayload = {
                title,
                message,
                data: data || {},
                deviceTokens
            };
            const mail = ['sivaranjitha9843@gmail.com'];
            await this.pushNotification.web().sendNotification(title, mail);
            // Store notification in database for history
            this.createNotification({
                userId,
                title,
                message,
                type: 'meal',
                scheduledTime: '',
                enabled: false
            });
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }
    async sendMealReminderNotification(userId, mealName, mealTime) {
        await this.sendPushNotification(userId, 'Meal Reminder', `Time for ${mealName}! Scheduled at ${mealTime}`, {
            type: 'meal_reminder',
            mealName,
            mealTime
        });
    }
    async sendProgressUpdateNotification(userId, progressType, value) {
        await this.sendPushNotification(userId, 'Progress Update', `Great job! Your ${progressType} has been updated to ${value}`, {
            type: 'progress_update',
            progressType,
            value
        });
    }
    async sendAIRecommendationNotification(userId, recommendation) {
        await this.sendPushNotification(userId, 'New AI Recommendation', recommendation, {
            type: 'ai_recommendation'
        });
    }
    async sendBulkNotification(userIds, title, message, data) {
        try {
            const promises = userIds.map(userId => this.sendPushNotification(userId, title, message, data));
            await Promise.all(promises);
        }
        catch (error) {
            console.error('Error sending bulk notifications:', error);
            throw error;
        }
    }
    // Meal notification scheduling
    async scheduleMealNotification(mealId, userId, scheduledTime, mealName) {
        try {
            const datastore = new datastore_1.Datastore();
            // Store scheduled notification in database
            await datastore.table('scheduled_notifications').insertRow({
                mealId,
                userId,
                scheduledTime,
                mealName,
                type: 'meal_reminder',
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            console.log(`Meal notification scheduled for user ${userId} at ${scheduledTime} for meal: ${mealName}`);
        }
        catch (error) {
            console.error('Error scheduling meal notification:', error);
            throw error;
        }
    }
    async checkAndSendMealNotifications() {
        try {
            const zcql = new zcql_1.ZCQL();
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
            console.log('Checking for meal notifications to send at:', currentTime);
            // Find pending meal notifications for current time (within 5 minutes window)
            const timeWindow = 5; // minutes
            const timeRanges = this.getTimeRange(currentTime, timeWindow);
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;
            for (const timeRange of timeRanges) {
                const pendingNotifications = await zcql.executeZCQLQuery(`select * from meals where completed='false' and scheduledTime='${currentTime}' and createdAt='${formattedDate}'`);
                for (const notification of pendingNotifications) {
                    const notificationData = notification.meals;
                    // Send push notification
                    await this.sendMealReminderNotification(notificationData.userId, notificationData.mealName, notificationData.scheduledTime);
                    // // Update notification status to sent
                    // const datastore = new Datastore();
                    // await datastore.table('meals').updateRow({
                    //   ROWID: notificationData.ROWID,
                    //   status: 'sent',
                    //   sentAt: new Date().toISOString()
                    // } as unknown as ICatalystRow);
                    console.log(`Meal reminder sent to user ${notificationData.userId} for meal: ${notificationData.mealName}`);
                }
            }
        }
        catch (error) {
            console.error('Error checking and sending meal notifications:', error);
        }
    }
    getTimeRange(currentTime, windowMinutes) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const times = [];
        for (let i = -windowMinutes; i <= windowMinutes; i++) {
            const targetMinutes = minutes + i;
            let targetHours = hours;
            let adjustedMinutes = targetMinutes;
            if (adjustedMinutes >= 60) {
                targetHours += Math.floor(adjustedMinutes / 60);
                adjustedMinutes = adjustedMinutes % 60;
            }
            else if (adjustedMinutes < 0) {
                targetHours += Math.floor(adjustedMinutes / 60);
                adjustedMinutes = 60 + (adjustedMinutes % 60);
            }
            if (targetHours >= 24)
                targetHours = targetHours % 24;
            if (targetHours < 0)
                targetHours = 24 + targetHours;
            const timeString = `${targetHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
            times.push(timeString);
        }
        return times;
    }
    async getMealNotificationHistory(userId) {
        try {
            const zcql = new zcql_1.ZCQL();
            const notifications = await zcql.executeZCQLQuery(`select * from meals where userId=${userId}`);
            return notifications;
        }
        catch (error) {
            console.error('Error fetching meal notification history:', error);
            return [];
        }
    }
    async cancelMealNotification(mealId, userId) {
        try {
            const zcql = new zcql_1.ZCQL();
            const notifications = await zcql.executeZCQLQuery(`select * from scheduled_notifications where mealId='${mealId}' and userId='${userId}' and status='pending'`);
            if (notifications.length > 0) {
                const datastore = new datastore_1.Datastore();
                await datastore.table('scheduled_notifications').updateRow({
                    ROWID: notifications[0].scheduled_notifications.ROWID,
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString()
                });
                console.log(`Meal notification cancelled for meal ${mealId} and user ${userId}`);
            }
        }
        catch (error) {
            console.error('Error cancelling meal notification:', error);
            throw error;
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map