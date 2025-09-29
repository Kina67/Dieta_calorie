import { UserProfile, ActivityLevel } from '../types';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calcola il Metabolismo Basale (BMR) usando l'equazione di Mifflin-St Jeor
const calculateBMR = (profile: UserProfile): number => {
  const { gender, weightKg, heightCm, age } = profile;
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else { // female
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

// Calcola il Fabbisogno Calorico Giornaliero Totale (TDEE) e lo adatta all'obiettivo
export const calculateDailyGoal = (profile: UserProfile): number => {
  const bmr = calculateBMR(profile);
  const tdee = bmr * activityMultipliers[profile.activityLevel];

  const weightDifferenceKg = profile.goalWeightKg - profile.weightKg;

  // Se l'obiettivo è mantenere il peso, non serve alcun aggiustamento
  if (weightDifferenceKg === 0) {
    return Math.round(tdee);
  }

  // Circa 7700 kcal per kg di peso corporeo
  const totalCaloriesToAdjust = weightDifferenceKg * 7700; 
  // Usa 30.44 come numero medio di giorni in un mese
  const totalDays = profile.goalTimeframeMonths * 30.44; 

  // Evita la divisione per zero se la tempistica è 0 o non valida
  if (totalDays <= 0) {
    return Math.round(tdee);
  }

  const dailyAdjustment = totalCaloriesToAdjust / totalDays;
  const goalCalories = tdee + dailyAdjustment;
  
  return Math.round(goalCalories);
};
