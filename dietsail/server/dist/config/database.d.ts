import { ICatalystRow } from '@zcatalyst/datastore/dist-types/utils/interface';
import { User, Food, Meal, DietPlan, Notification, ProgressEntry, AIRecommendation } from '../types';
import { Datastore } from '@zcatalyst/datastore';
export declare class Database {
    private static instance;
    users: Map<string, User>;
    foods: Map<string, Food>;
    meals: Map<string, Meal>;
    dietPlans: Map<string, DietPlan>;
    notifications: Map<string, Notification>;
    progressEntries: Map<string, ProgressEntry>;
    aiRecommendations: Map<string, AIRecommendation>;
    datastore: Datastore;
    private constructor();
    static getInstance(): Database;
    private initializeFoodDatabase;
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User;
    getUserById(id: string): User | undefined;
    getUserByEmail(email: string): User | undefined;
    updateUser(id: string, updates: Partial<User>): User | undefined;
    getAllFoods(): Promise<ICatalystRow[]>;
    getFoodById(id: string): Food | undefined;
    searchFoods(query: string): Food[];
    createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Meal;
    getMealsByUserId(userId: string): Meal[];
    getMealsByUserAndDate(userId: string, date: string): Meal[];
    createNotification(notification: Omit<Notification, 'id'>): Notification;
    getNotificationsByUserId(userId: string): Notification[];
    updateNotification(id: string, updates: Partial<Notification>): Notification | undefined;
    createProgressEntry(entry: Omit<ProgressEntry, 'id'>): ProgressEntry;
    getProgressByUserId(userId: string): ProgressEntry[];
}
//# sourceMappingURL=database.d.ts.map