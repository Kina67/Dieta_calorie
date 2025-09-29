import React, { useEffect, useState, useRef } from 'react';
import { FoodAnalysisResult, MealType } from '../types';

interface ResultCardProps {
  result: FoodAnalysisResult;
  onWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customWeight: string;
  recalculatedCalories: number | null;
  recalculatedMacros: {
    carbs: number | null;
    proteins: number | null;
    fats: number | null;
  };
  onAddToLog: (calories: number, mealType: MealType, dishName: string) => void;
}

const FireIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 5 15 7.009 15 9c1.007 0 1.506.398 1.957.857A7.001 7.001 0 0112 21a7.001 7.001 0 015.657-2.343z" />
  </svg>
);

const ScaleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l-6-2m0 0l-6 5m6-5l6 5m-6 5l-3 9a5.002 5.002 0 006.001 0M18 7l-3 9m-3-9l-6 5m12 0l-6 5" />
    </svg>
);

const ListIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const CarbIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM5 19.5v-14" />
    </svg>
);

const ProteinIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-4.142 0-7.5-3.358-7.5-7.5S7.858 6.75 12 6.75s7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5z" transform="rotate(-45 12 12)" />
        <path d="M12,2.25A9.75,9.75 0 0,0 2.25,12c0,4.142 3.358,7.5 7.5,7.5" fill="currentColor" opacity="0.3" transform="rotate(-45 12 12)"/>
    </svg>
);

const FatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// Meal Icons
const BreakfastIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 10V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" /></svg>;
const SnackIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.572l-7.5 7.428-7.5-7.428m15 0A23.1 23.1 0 0012 3.5c-3.373 0-6.523 1.04-9 2.845M19.5 12.572V19.5" /><path d="M12 3.5c3.373 0 6.523 1.04 9 2.845" /><path d="M12 12.5a.5.5 0 011 0 .5.5 0 01-1 0z" transform="translate(-.5 -.5)" /><path d="M12 11.5a.5.5 0 010 1 .5.5 0 010-1z" transform="translate(-.5 -.5)" /><path d="M12 10.5a.5.5 0 011 0 .5.5 0 01-1 0z" transform="translate(-.5 -.5)" /><path d="M12 9.5a.5.5 0 010 1 .5.5 0 010-1z" transform="translate(-.5 -.5)" /></svg>;
const LunchIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2.25 2.25L7.5 12l-2.25-2.25L3 12zm0 0h18M3 6h18M3 18h18" /></svg>;
const DinnerIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const mealTypes: { id: MealType; label: string; icon: React.FC }[] = [
    { id: 'breakfast', label: 'Colazione', icon: BreakfastIcon },
    { id: 'snack', label: 'Spuntino', icon: SnackIcon },
    { id: 'lunch', label: 'Pranzo', icon: LunchIcon },
    { id: 'dinner', label: 'Cena', icon: DinnerIcon },
];

const ResultCard: React.FC<ResultCardProps> = ({ result, onWeightChange, customWeight, recalculatedCalories, recalculatedMacros, onAddToLog }) => {
  const [highlight, setHighlight] = useState(false);
  const [addedToLog, setAddedToLog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const prevRecalculatedCalories = useRef<number | null>(null);

  useEffect(() => {
    // Evidenzia quando le calorie vengono ricalcolate e il valore è diverso dal precedente
    if (recalculatedCalories !== null && recalculatedCalories !== prevRecalculatedCalories.current) {
      setHighlight(true);
      const timer = setTimeout(() => {
        setHighlight(false);
      }, 1200); // La durata corrisponde all'animazione CSS

      prevRecalculatedCalories.current = recalculatedCalories;
      
      return () => clearTimeout(timer);
    }
    // Se l'input viene cancellato, resetta lo stato
    if (recalculatedCalories === null && prevRecalculatedCalories.current !== null) {
        prevRecalculatedCalories.current = null;
    }
  }, [recalculatedCalories]);
    
  const displayCalories = recalculatedCalories ?? result.calories;
  const displayCarbs = recalculatedMacros.carbs ?? result.carbohydratesGrams;
  const displayProteins = recalculatedMacros.proteins ?? result.proteinsGrams;
  const displayFats = recalculatedMacros.fats ?? result.fatsGrams;

  const customWeightNum = parseFloat(customWeight);
  const isRecalculated = customWeightNum > 0 && recalculatedCalories !== null;
  
  let displayQuantity: string;
  if (isRecalculated) {
      displayQuantity = `${customWeightNum} g`;
  } else {
      displayQuantity = `${result.quantity} (${result.estimatedWeightGrams} g)`;
  }


  const handleAddToLog = () => {
    onAddToLog(displayCalories, selectedMeal, result.dishName);
    setAddedToLog(true);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden w-full animate-fade-in">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 text-center mb-6">
          {result.dishName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4 transition-colors ${highlight ? 'animate-highlight bg-teal-50 dark:bg-teal-900/50' : ''}`}>
            <FireIcon />
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                Calorie
                {isRecalculated && <PencilIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-2" />}
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{displayCalories} kcal</p>
            </div>
          </div>
          <div className={`bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4 transition-colors ${highlight ? 'animate-highlight bg-teal-50 dark:bg-teal-900/50' : ''}`}>
            <ScaleIcon />
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                Quantità
                {isRecalculated && <PencilIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-2" />}
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{displayQuantity}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">Riepilogo Nutrizionale</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className={`bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center transition-colors ${highlight ? 'animate-highlight bg-teal-50 dark:bg-teal-900/50' : ''}`}>
                    <CarbIcon />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Carboidrati</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{displayCarbs} g</p>
                </div>
                <div className={`bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center transition-colors ${highlight ? 'animate-highlight bg-teal-50 dark:bg-teal-900/50' : ''}`}>
                    <ProteinIcon />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Proteine</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{displayProteins} g</p>
                </div>
                <div className={`bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center transition-colors ${highlight ? 'animate-highlight bg-teal-50 dark:bg-teal-900/50' : ''}`}>
                    <FatIcon />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Grassi</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{displayFats} g</p>
                </div>
            </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center"><ListIcon /><span className="ml-2">Ingredienti Principali</span></h3>
          <ul className="space-y-2">
            {result.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                <svg className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">Perfeziona il Calcolo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Se conosci il peso esatto, inseriscilo qui per un calcolo più preciso.</p>
            <div className="relative">
                <input
                    type="number"
                    value={customWeight}
                    onChange={onWeightChange}
                    placeholder={`Es. ${result.estimatedWeightGrams}`}
                    className="w-full pl-3 pr-12 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    aria-label="Peso personalizzato in grammi"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400">
                    g
                </span>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 text-center mb-3">A quale pasto corrisponde?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mealTypes.map((meal) => {
                    const isSelected = selectedMeal === meal.id;
                    return (
                        <button 
                            key={meal.id} 
                            onClick={() => setSelectedMeal(meal.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors duration-200 ${
                                isSelected 
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/50' 
                                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                            aria-pressed={isSelected}
                        >
                            <div className={`mb-1 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                <meal.icon />
                            </div>
                            <span className={`font-semibold text-sm ${isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {meal.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>

        <div>
            <button
                onClick={handleAddToLog}
                disabled={addedToLog}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover:bg-green-700 dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                {addedToLog ? 'Aggiunto al Diario!' : 'Aggiungi al Diario'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;