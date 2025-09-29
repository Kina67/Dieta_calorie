export interface FoodAnalysisResult {
  dishName: string;
  quantity: string;
  calories: number;
  ingredients: string[];
  estimatedWeightGrams: number;
  carbohydratesGrams: number;
  proteinsGrams: number;
  fatsGrams: number;
}

export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner';

// Un'unica voce di pasto registrata
export interface MealEntry {
  id: string;
  calories: number;
  dishName: string;
}

// Tipi per lo Spazio Personale
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female';

export interface UserProfile {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goalWeightKg: number;
  goalTimeframeMonths: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  goalCalories: number;
  meals: {
    breakfast: MealEntry[];
    snack: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
  };
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}