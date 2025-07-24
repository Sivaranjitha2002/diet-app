import { User, NutritionGoals } from '../types';
export declare function calculateBMI(weight: number, height: number): number;
export declare function getBMICategory(bmi: number): string;
export declare function calculateBMR(user: Record<string, any>): number;
export declare function calculateTDEE(bmr: number, activityLevel: User['activityLevel']): number;
export declare function calculateDailyCalories(user: Record<string, any>): number;
export declare function generateNutritionGoals(user: Record<string, any>): NutritionGoals;
//# sourceMappingURL=calculations.d.ts.map