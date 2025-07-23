export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  dietGoal: 'lose' | 'maintain' | 'gain';
  dietPreferences: string[];
  allergies: string[];
  healthConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  vitaminD: number;
}

export interface Meal {
  id: string;
  userId: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: {
    foodId: string;
    quantity: number; // in grams
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  scheduledTime: string;
  date: string;
  consumed: boolean;
  createdAt: Date;
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  duration: number; // in days
  dailyCalories: number;
  meals: string[]; // meal IDs
  createdAt: Date;
  aiGenerated: boolean;
}

export interface NutritionGoals {
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in ml
}

export interface Notification {
  id: string;
  userId: string;
  type: 'meal' | 'exercise' | 'weight-check' | 'health-check';
  title: string;
  message: string;
  scheduledTime: string;
  enabled: boolean;
  lastSent?: Date;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  exercise?: {
    type: string;
    duration: number; // in minutes
    caloriesBurned: number;
  };
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'meal' | 'exercise' | 'lifestyle';
  title: string;
  description: string;
  confidence: number;
  createdAt: Date;
}