// In-memory database simulation
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)

import { ICatalystRow } from '@zcatalyst/datastore/dist-types/utils/interface';
import { User, Food, Meal, DietPlan, Notification, ProgressEntry, AIRecommendation } from '../types';
import { Datastore } from '@zcatalyst/datastore';
import dotenv from 'dotenv';
dotenv.config();

export class Database {
  private static instance: Database;
  
  public users: Map<string, User> = new Map();
  public foods: Map<string, Food> = new Map();
  public meals: Map<string, Meal> = new Map();
  public dietPlans: Map<string, DietPlan> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public progressEntries: Map<string, ProgressEntry> = new Map();
  public aiRecommendations: Map<string, AIRecommendation> = new Map();

  public datastore: Datastore = new Datastore();

  private constructor() {
    // this.initializeFoodDatabase();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // private initializeFoodDatabase() {
  //   const foods: Food[] = [];
  //   foods.forEach(food => this.foods.set(food.id, food));
  // }

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
  public async getAllFoods(): Promise<ICatalystRow[]> {
    const table = this.datastore.table('6066000000191009');
    return (await table.getPagedRows()).data
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
  public createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Meal {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.meals.set(newMeal.id, newMeal);
    return newMeal;
  }

  public getMealsByUserId(userId: string): Meal[] {
    return Array.from(this.meals.values()).filter(meal => meal.userId === userId);
  }

  public getMealsByUserAndDate(userId: string, date: string): Meal[] {
    return Array.from(this.meals.values()).filter(
      meal => meal.userId === userId && meal.date === date
    );
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
}