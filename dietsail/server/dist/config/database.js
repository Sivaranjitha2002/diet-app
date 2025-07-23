"use strict";
// In-memory database simulation
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const datastore_1 = require("@zcatalyst/datastore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Database {
    constructor() {
        this.users = new Map();
        this.foods = new Map();
        this.meals = new Map();
        this.dietPlans = new Map();
        this.notifications = new Map();
        this.progressEntries = new Map();
        this.aiRecommendations = new Map();
        this.datastore = new datastore_1.Datastore();
        this.initializeFoodDatabase();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    initializeFoodDatabase() {
        const foods = [];
        foods.forEach(food => this.foods.set(food.id, food));
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
    getUserById(id) {
        return this.users.get(id);
    }
    getUserByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email);
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
        const table = this.datastore.table('6066000000191009');
        return (await table.getPagedRows()).data;
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
    createMeal(meal) {
        const newMeal = {
            ...meal,
            id: Date.now().toString(),
            createdAt: new Date()
        };
        this.meals.set(newMeal.id, newMeal);
        return newMeal;
    }
    getMealsByUserId(userId) {
        return Array.from(this.meals.values()).filter(meal => meal.userId === userId);
    }
    getMealsByUserAndDate(userId, date) {
        return Array.from(this.meals.values()).filter(meal => meal.userId === userId && meal.date === date);
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
}
exports.Database = Database;
//# sourceMappingURL=database.js.map