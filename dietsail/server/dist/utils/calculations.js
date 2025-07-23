"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBMI = calculateBMI;
exports.getBMICategory = getBMICategory;
exports.calculateBMR = calculateBMR;
exports.calculateTDEE = calculateTDEE;
exports.calculateDailyCalories = calculateDailyCalories;
exports.generateNutritionGoals = generateNutritionGoals;
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}
function getBMICategory(bmi) {
    if (bmi < 18.5)
        return 'Underweight';
    if (bmi < 25)
        return 'Normal weight';
    if (bmi < 30)
        return 'Overweight';
    return 'Obese';
}
function calculateBMR(user) {
    // Mifflin-St Jeor Equation
    const { weight, height, age, gender } = user;
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}
function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very-active': 1.9
    };
    return Math.round(bmr * multipliers[activityLevel]);
}
function calculateDailyCalories(user) {
    const bmr = calculateBMR(user);
    const tdee = calculateTDEE(bmr, user.activityLevel);
    switch (user.dietGoal) {
        case 'lose':
            return Math.round(tdee - 500); // 500 calorie deficit
        case 'gain':
            return Math.round(tdee + 300); // 300 calorie surplus
        default:
            return tdee;
    }
}
function generateNutritionGoals(user) {
    const dailyCalories = calculateDailyCalories(user);
    return {
        userId: user.id,
        calories: dailyCalories,
        protein: Math.round((dailyCalories * 0.25) / 4), // 25% of calories from protein
        carbs: Math.round((dailyCalories * 0.45) / 4), // 45% of calories from carbs
        fat: Math.round((dailyCalories * 0.30) / 9), // 30% of calories from fat
        fiber: Math.max(25, Math.round(dailyCalories / 100)), // At least 25g
        water: user.weight * 35 // 35ml per kg body weight
    };
}
//# sourceMappingURL=calculations.js.map