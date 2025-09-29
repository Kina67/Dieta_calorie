import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, WeightEntry, MealType, MealEntry } from '../types';
import WeeklyCalendar from './WeeklyCalendar';
import WeeklyChart from './WeeklyChart';
import WeightChart from './WeightChart';
import DarkModeToggle from './DarkModeToggle';
import ConfirmationModal from './ConfirmationModal';

interface PersonalSpaceProps {
  userProfile: UserProfile;
  dailyLog: DailyLog;
  logHistory: DailyLog[];
  onResetProfile: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onUpdateGoalCalories: (newGoal: number) => void;
  weightHistory: WeightEntry[];
  onAddWeightEntry: (weight: number) => void;
  onDeleteMeal: (mealType: MealType, mealId: string) => void;
}

const activityLabels: Record<string, string> = {
    sedentary: 'Sedentario',
    light: 'Leggero',
    moderate: 'Moderato',
    active: 'Attivo',
    very_active: 'Molto Attivo'
};

const mealLabels: Record<MealType, string> = {
    breakfast: 'Colazione',
    snack: 'Spuntino',
    lunch: 'Pranzo',
    dinner: 'Cena',
};

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const PersonalSpace: React.FC<PersonalSpaceProps> = ({ userProfile, dailyLog, logHistory, onResetProfile, isDarkMode, onThemeToggle, onUpdateGoalCalories, weightHistory, onAddWeightEntry, onDeleteMeal }) => {
  const { goalCalories, meals } = dailyLog;
  // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
  // Replaced Object.values().flat() with a more explicit array spread to ensure proper type inference for meal entries. This resolves errors in calculating `currentCalories` and subsequent values.
  const currentCalories = [
    ...(meals.breakfast || []),
    ...(meals.snack || []),
    ...(meals.lunch || []),
    ...(meals.dinner || []),
  ].reduce((sum, meal) => sum + meal.calories, 0);

  const isOverGoal = currentCalories > goalCalories;
  const caloriesRemaining = goalCalories - currentCalories;
  
  const progressPercentageRaw = goalCalories > 0 ? (currentCalories / goalCalories) * 100 : 0;
  const progressPercentageCapped = Math.min(progressPercentageRaw, 100);
  const progressBarColor = isOverGoal ? 'bg-red-500' : 'bg-teal-500';

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState(dailyLog.goalCalories.toString());
  const [newWeight, setNewWeight] = useState('');
  const [mealToDelete, setMealToDelete] = useState<{ type: MealType; id: string; calories: number; dishName: string; } | null>(null);

  useEffect(() => {
    setEditedGoal(dailyLog.goalCalories.toString());
  }, [dailyLog.goalCalories]);

  const handleGoalEdit = () => {
    setIsEditingGoal(true);
  };

  const handleGoalCancel = () => {
    setIsEditingGoal(false);
    setEditedGoal(dailyLog.goalCalories.toString());
  };

  const handleGoalSave = () => {
    const newGoal = parseInt(editedGoal, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      onUpdateGoalCalories(newGoal);
      setIsEditingGoal(false);
    } else {
      handleGoalCancel();
    }
  };
  
  const handleAddWeight = () => {
    const weight = parseFloat(newWeight);
    if (!isNaN(weight) && weight > 0) {
        onAddWeightEntry(weight);
        setNewWeight('');
    }
  };

  const handleConfirmDelete = () => {
    if (mealToDelete) {
        onDeleteMeal(mealToDelete.type, mealToDelete.id);
    }
    setMealToDelete(null);
  }

  const weightDifference = userProfile.goalWeightKg - userProfile.weightKg;
  let goalSummary = `Mantenere il tuo peso di ${userProfile.weightKg} kg.`;
  if (weightDifference < 0) {
      goalSummary = `Perdere ${Math.abs(weightDifference).toFixed(1)} kg in ${userProfile.goalTimeframeMonths} mesi.`;
  } else if (weightDifference > 0) {
      goalSummary = `Guadagnare ${weightDifference.toFixed(1)} kg in ${userProfile.goalTimeframeMonths} mesi.`;
  }

  const mealEntries = Object.entries(meals) as [MealType, MealEntry[]][];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 text-center mb-6">Il Tuo Riepilogo di Oggi</h1>
        
        <div className="space-y-6 mb-8">
          {mealEntries.map(([mealType, entries]) => (
            <div key={mealType}>
              <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                {mealLabels[mealType]}
              </h3>
              {entries.length > 0 ? (
                <div className="space-y-2">
                  {entries.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg animate-fade-in">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{meal.dishName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{meal.calories} kcal</p>
                      </div>
                      <button 
                        onClick={() => setMealToDelete({ type: mealType, id: meal.id, calories: meal.calories, dishName: meal.dishName })} 
                        className="text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors flex-shrink-0 ml-4" 
                        aria-label={`Elimina pasto ${meal.dishName}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">Nessun pasto registrato.</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2">
                {!isEditingGoal ? (
                    <>
                        <p className="text-slate-600 dark:text-slate-400">Obiettivo: <span className="font-bold text-teal-600 dark:text-teal-400">{goalCalories} kcal</span></p>
                        <button onClick={handleGoalEdit} className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400" aria-label="Modifica obiettivo calorie">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <label htmlFor="goal-input" className="text-slate-600 dark:text-slate-400">Nuovo Obiettivo:</label>
                        <input
                            id="goal-input"
                            type="number"
                            value={editedGoal}
                            onChange={(e) => setEditedGoal(e.target.value)}
                            className="w-24 p-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button onClick={handleGoalSave} className="px-3 py-1 bg-teal-600 text-white font-semibold text-sm rounded-md hover:bg-teal-700">Salva</button>
                        <button onClick={handleGoalCancel} className="px-3 py-1 bg-slate-500 text-white font-semibold text-sm rounded-md hover:bg-slate-600">Annulla</button>
                    </div>
                )}
            </div>
            <p className="text-slate-600 dark:text-slate-400">Consumate: <span className="font-bold text-slate-800 dark:text-slate-200">{currentCalories} kcal</span></p>
            <p className="text-slate-600 dark:text-slate-400">
                {isOverGoal ? 'Eccesso' : 'Rimanenti'}:
                <span className={`font-bold ${isOverGoal ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {' '}{Math.abs(caloriesRemaining)} kcal
                </span>
            </p>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-2">
            <div 
                className={`${progressBarColor} h-4 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${progressPercentageCapped}%` }}
            ></div>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">{Math.round(progressPercentageRaw)}% del tuo obiettivo giornaliero</p>
      </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-4">La Tua Settimana</h2>
        <WeeklyCalendar logHistory={logHistory} goalCalories={dailyLog.goalCalories} />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-6">Andamento Calorico Settimanale</h2>
        <WeeklyChart logHistory={logHistory} goalCalories={dailyLog.goalCalories} />
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-6">Andamento del Peso</h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 max-w-md mx-auto">
            <div className="relative flex-grow w-full sm:w-auto">
                <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder={`Peso odierno (es. ${userProfile.weightKg})`}
                    className="w-full pl-3 pr-12 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    aria-label="Nuova registrazione peso in kg"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400">
                    kg
                </span>
            </div>
            <button
                onClick={handleAddWeight}
                disabled={!newWeight || parseFloat(newWeight) <= 0}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                Registra
            </button>
        </div>
        
        <WeightChart
            history={weightHistory}
            startWeight={userProfile.weightKg}
            goalWeight={userProfile.goalWeightKg}
        />
      </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">Il Tuo Obiettivo di Peso</h2>
            <div className="text-center space-y-2">
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{userProfile.goalWeightKg}<span className="text-2xl text-slate-500 dark:text-slate-400"> kg</span></p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{goalSummary}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">(Partendo da un peso di {userProfile.weightKg} kg)</p>
            </div>
        </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Impostazioni</h2>
        <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Tema Scuro</span>
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
        </div>
      </div>
        
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Il Tuo Profilo</h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Peso Obiettivo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.goalWeightKg} kg</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Tempistica Obiettivo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.goalTimeframeMonths} mesi</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Livello Attività</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{activityLabels[userProfile.activityLevel]}</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Sesso</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.gender === 'female' ? 'Donna' : 'Uomo'}</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Età</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.age} anni</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Peso Iniziale</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.weightKg} kg</span>
            </li>
            <li className="py-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Altezza</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile.heightCm} cm</span>
            </li>
        </ul>
        <div className="mt-8">
          {!isConfirmingReset ? (
              <button 
                  onClick={() => setIsConfirmingReset(true)}
                  className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-colors"
              >
                  Modifica Profilo e Resetta Dati
              </button>
          ) : (
              <div className="bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
                  <p className="font-semibold text-red-800 dark:text-red-300">Sei sicuro di voler resettare?</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">Questa azione è irreversibile e cancellerà il tuo profilo e lo storico dei consumi.</p>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <button
                          onClick={() => setIsConfirmingReset(false)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                      >
                          Annulla
                      </button>
                      <button
                          onClick={onResetProfile}
                          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                          Sì, Resetta
                      </button>
                  </div>
              </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={mealToDelete !== null}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Conferma Eliminazione Pasto"
        message={`Sei sicuro di voler eliminare "${mealToDelete?.dishName}" (${mealToDelete?.calories} kcal)? L'azione è irreversibile.`}
      />
    </div>
  );
};

export default PersonalSpace;