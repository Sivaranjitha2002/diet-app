import { User, NutritionGoals } from '../types';
export declare function calculateBMI(weight: number, height: number): number;
export declare function getBMICategory(bmi: number): string;
export declare function calculateBMR(user: User): number;
export declare function calculateTDEE(bmr: number, activityLevel: User['activityLevel']): number;
export declare function calculateDailyCalories(user: User): number;
export declare function generateNutritionGoals(user: User): NutritionGoals;
//# sourceMappingURL=calculations.d.ts.map