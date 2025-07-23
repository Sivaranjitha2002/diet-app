export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: {
    food: Food;
    quantity: number; // in grams
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  scheduledTime: string;
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  duration: number; // in days
  dailyCalories: number;
  meals: Meal[];
  createdAt: Date;
  aiGenerated: boolean;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in ml
}

export interface Notification {
  id: string;
  type: 'meal' | 'exercise' | 'weight-check' | 'health-check';
  title: string;
  message: string;
  scheduledTime: string;
  enabled: boolean;
}