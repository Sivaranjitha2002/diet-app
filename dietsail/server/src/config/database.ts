// In-memory database simulation
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)

import { ICatalystRow } from '@zcatalyst/datastore/dist-types/utils/interface';
import { User, Food, Meal, DietPlan, Notification, ProgressEntry, AIRecommendation } from '../types';
import { Datastore } from '@zcatalyst/datastore';
import { ZCQL } from '@zcatalyst/zcql';
import { PushNotification } from '@zcatalyst/push-notification';

export class Database {
  private static instance: Database;
  private pushNotification: PushNotification;
  
  public users: Map<string, User> = new Map();
  public foods: Map<string, Food> = new Map();
  public meals: Map<string, Meal> = new Map();
  public dietPlans: Map<string, DietPlan> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public progressEntries: Map<string, ProgressEntry> = new Map();
  public aiRecommendations: Map<string, AIRecommendation> = new Map();

  private constructor() {
    this.pushNotification = new PushNotification();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // User operations
  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }


  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Food operations
  public async getAllFoods(): Promise<Record<string, unknown>[]> {
    const zcql = new ZCQL();
    let table = await zcql.executeZCQLQuery('select * from foods');
    table = table.map(tables => (tables.foods));
    return table;
  }

  public getFoodById(id: string): Food | undefined {
    return this.foods.get(id);
  }

  public searchFoods(query: string): Food[] {
    const foods = Array.from(this.foods.values());
    return foods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Meal operations
  public async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<ICatalystRow> {
    const datastore: Datastore = new Datastore();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    const newMeal: Record<string, unknown> = {
      ...meal,
      id: Date.now().toString(),
      createdAt: formattedDate
    };
    const response = await datastore.table('meals').insertRow(newMeal);
    return response;
  }

  public async getMealsByUserId(userId: string): Promise<Array<Record<string, unknown>>> {
    const zcql: ZCQL = new ZCQL();
    if (!userId) return [];

    const meals = await zcql.executeZCQLQuery(`select * from meals where userId='${userId}' and completed='false'`);
    return meals;
  }

  public async getMealsByUserAndDate(userId: string, date: string): Promise<Array<Record<string, unknown>>> {
    const zcql: ZCQL = new ZCQL();
    console.log('Fetching meals for user:', userId, 'on date:', date);
    if (!userId) return [];

    const meals = await zcql.executeZCQLQuery(
      `select * from meals where userId='${userId}' and createdAt='${date}' and completed='false'`
    );
    return meals;
  }

  public async updateMeal(id: string, updates: Partial<Meal>): Promise<Record<string, unknown>> {
    const datastore: Datastore = new Datastore();
    const newMeal: Record<string, unknown> = {
      ...updates,
      ROWID: id,
    };
    const response = await datastore.table('30268000000048631').updateRow(newMeal as ICatalystRow);
    return response;
  }

  // Notification operations
  public createNotification(notification: Omit<Notification, 'id'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString()
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  public getNotificationsByUserId(userId: string): Notification[] {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId
    );
  }

  public updateNotification(id: string, updates: Partial<Notification>): Notification | undefined {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { ...notification, ...updates };
      this.notifications.set(id, updatedNotification);
      return updatedNotification;
    }
    return undefined;
  }

  // Progress operations
  public createProgressEntry(entry: Omit<ProgressEntry, 'id'>): ProgressEntry {
    const newEntry: ProgressEntry = {
      ...entry,
      id: Date.now().toString()
    };
    this.progressEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  public getProgressByUserId(userId: string): ProgressEntry[] {
    return Array.from(this.progressEntries.values()).filter(
      entry => entry.userId === userId
    );
  }

  // Push Notification operations
  public async registerDeviceToken(userId: string, deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    try {
      const datastore = new Datastore();
      
      // Check if device token already exists for user
      const zcql = new ZCQL();
      const existingTokens = await zcql.executeZCQLQuery(
        `select * from device_tokens where userId='${userId}' and deviceToken='${deviceToken}'`
      );

      if (existingTokens.length === 0) {
        // Insert new device token
        await datastore.table('device_tokens').insertRow({
          userId,
          deviceToken,
          platform,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing token to active
        await datastore.table('device_tokens').updateRow({
          ROWID: existingTokens[0].ROWID,
          isActive: true,
          updatedAt: new Date().toISOString()
        } as unknown as ICatalystRow);
      }
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  public async removeDeviceToken(userId: string, deviceToken: string): Promise<void> {
    try {
      const zcql = new ZCQL();
      const existingTokens = await zcql.executeZCQLQuery(
        `select * from device_tokens where userId='${userId}' and deviceToken='${deviceToken}'`
      );

      if (existingTokens.length > 0) {
        const datastore = new Datastore();
        await datastore.table('device_tokens').updateRow({
          ROWID: existingTokens[0].ROWID,
          isActive: false,
          updatedAt: new Date().toISOString()
        } as unknown as ICatalystRow);
      }
    } catch (error) {
      console.error('Error removing device token:', error);
      throw error;
    }
  }

  public async getUserDeviceTokens(userId: string): Promise<string[]> {
    try {
      const zcql = new ZCQL();
      const tokens = await zcql.executeZCQLQuery(
        `select deviceToken from device_tokens where userId='${userId}' and isActive=true`
      );
      return tokens.map((token: any) => token.device_tokens.deviceToken);
    } catch (error) {
      console.error('Error fetching device tokens:', error);
      return [];
    }
  }

  public async sendPushNotification(
    userId: string, 
    title: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<void> {
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

    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  public async sendMealReminderNotification(userId: string, mealName: string, mealTime: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Meal Reminder',
      `Time for ${mealName}! Scheduled at ${mealTime}`,
      {
        type: 'meal_reminder',
        mealName,
        mealTime
      }
    );
  }

  public async sendProgressUpdateNotification(userId: string, progressType: string, value: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Progress Update',
      `Great job! Your ${progressType} has been updated to ${value}`,
      {
        type: 'progress_update',
        progressType,
        value
      }
    );
  }

  public async sendAIRecommendationNotification(userId: string, recommendation: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'New AI Recommendation',
      recommendation,
      {
        type: 'ai_recommendation'
      }
    );
  }

  public async sendBulkNotification(
    userIds: string[], 
    title: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const promises = userIds.map(userId => 
        this.sendPushNotification(userId, title, message, data)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Meal notification scheduling
  public async scheduleMealNotification(mealId: string, userId: string, scheduledTime: string, mealName: string): Promise<void> {
    try {
      const datastore = new Datastore();
      
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
    } catch (error) {
      console.error('Error scheduling meal notification:', error);
      throw error;
    }
  }

  public async checkAndSendMealNotifications(): Promise<void> {
    try {
      const zcql = new ZCQL();
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      // Find pending meal notifications for current time (within 5 minutes window)
      const timeWindow = 5; // minutes
      const timeRanges = this.getTimeRange(currentTime, timeWindow);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      for (const timeRange of timeRanges) {
        const pendingNotifications = await zcql.executeZCQLQuery(
          `select * from meals where completed='false' and scheduledTime='${currentTime}' and createdAt='${formattedDate}'`
        );

        for (const notification of pendingNotifications) {
          const notificationData = notification.meals;
          
          // Send push notification
          await this.sendMealReminderNotification(
            notificationData.userId,
            notificationData.mealName,
            notificationData.scheduledTime
          );

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
    } catch (error) {
      console.error('Error checking and sending meal notifications:', error);
    }
  }

  private getTimeRange(currentTime: string, windowMinutes: number): string[] {
    const [hours, minutes] = currentTime.split(':').map(Number);
    const times: string[] = [];
    
    for (let i = -windowMinutes; i <= windowMinutes; i++) {
      const targetMinutes = minutes + i;
      let targetHours = hours;
      let adjustedMinutes = targetMinutes;

      if (adjustedMinutes >= 60) {
        targetHours += Math.floor(adjustedMinutes / 60);
        adjustedMinutes = adjustedMinutes % 60;
      } else if (adjustedMinutes < 0) {
        targetHours += Math.floor(adjustedMinutes / 60);
        adjustedMinutes = 60 + (adjustedMinutes % 60);
      }

      if (targetHours >= 24) targetHours = targetHours % 24;
      if (targetHours < 0) targetHours = 24 + targetHours;

      const timeString = `${targetHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
      times.push(timeString);
    }

    return times;
  }

  public async getMealNotificationHistory(userId: string): Promise<Array<Record<string, unknown>>> {
    try {
      const zcql = new ZCQL();
      const notifications = await zcql.executeZCQLQuery(
        `select * from meals where userId=${userId}`
      );
      return notifications;
    } catch (error) {
      console.error('Error fetching meal notification history:', error);
      return [];
    }
  }

  public async cancelMealNotification(mealId: string, userId: string): Promise<void> {
    try {
      const zcql = new ZCQL();
      const notifications = await zcql.executeZCQLQuery(
        `select * from scheduled_notifications where mealId='${mealId}' and userId='${userId}' and status='pending'`
      );

      if (notifications.length > 0) {
        const datastore = new Datastore();
        await datastore.table('scheduled_notifications').updateRow({
          ROWID: notifications[0].scheduled_notifications.ROWID,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        } as unknown as ICatalystRow);

        console.log(`Meal notification cancelled for meal ${mealId} and user ${userId}`);
      }
    } catch (error) {
      console.error('Error cancelling meal notification:', error);
      throw error;
    }
  }

  // Override createMeal to automatically schedule notifications
  // public async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<ICatalystRow> {
  //   const datastore: Datastore = new Datastore();
  //   const newMeal: Record<string, unknown> = {
  //     ...meal,
  //     id: Date.now().toString(),
  //   };
  //   const response = await datastore.table('30268000000048631').insertRow(newMeal);

  //   // Schedule meal notification if scheduledTime is provided
  //   if (meal.scheduledTime && meal.userId) {
  //     await this.scheduleMealNotification(
  //       newMeal.id as string,
  //       meal.userId,
  //       meal.scheduledTime,
  //       meal.name
  //     );
  //   }

  //   return response;
  // }
}