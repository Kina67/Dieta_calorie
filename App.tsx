import React, { useState, useCallback, useEffect } from 'react';
import ImageInput from './components/ImageInput';
import ResultCard from './components/ResultCard';
import Spinner from './components/Spinner';
import Onboarding from './components/Onboarding';
import PersonalSpace from './components/PersonalSpace';
import DailySummary from './components/DailySummary';
import WeeklyCalendar from './components/WeeklyCalendar';
import { analyzeFoodImage, analyzeFoodText } from './services/geminiService';
import { calculateDailyGoal } from './services/calorieService';
import { FoodAnalysisResult, UserProfile, DailyLog, WeightEntry, MealType, MealEntry } from './types';

type View = 'ANALYZER' | 'PERSONAL_SPACE';

// Funzione helper per determinare il tema iniziale in modo sincrono
const getInitialTheme = (): boolean => {
  // Evita errori durante il Server-Side Rendering
  if (typeof window === 'undefined') return false;

  const savedTheme = window.localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  // Altrimenti, rispetta le preferenze di sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};


const App: React.FC = () => {
  // State per l'analisi
  const [image, setImage] = useState<{ dataUrl: string; mimeType: string; } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customWeight, setCustomWeight] = useState<string>('');
  
  // State per lo spazio personale
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [logHistory, setLogHistory] = useState<DailyLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [currentView, setCurrentView] = useState<View>('ANALYZER');
  
  // State per il tema scuro, inizializzato con la funzione helper
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // Questo useEffect gestisce gli effetti collaterali del cambio di tema
  useEffect(() => {
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [isDarkMode]);

  const handleThemeToggle = useCallback(() => {
      setIsDarkMode(prev => !prev);
  }, []);

  // Caricamento dati da localStorage all'avvio
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile);
        setUserProfile(profile);

        const savedHistory = localStorage.getItem('logHistory');
        if (savedHistory) {
            let history: any[] = JSON.parse(savedHistory);
            
            // Migrazione dati per supportare il nuovo formato `MealEntry[]` e aggiungere `dishName`
            const migratedHistory: DailyLog[] = history.map(log => {
                let currentLog = { ...log };

                // 1. Migrazione strutturale da formati molto vecchi
                if (currentLog.meals && typeof currentLog.meals.breakfast === 'number') {
                    const newMeals: DailyLog['meals'] = { breakfast: [], snack: [], lunch: [], dinner: [] };
                    if (currentLog.meals.breakfast > 0) newMeals.breakfast.push({ id: `mig-${currentLog.date}-breakfast`, calories: currentLog.meals.breakfast, dishName: 'Pasto migrato' });
                    if (currentLog.meals.snack > 0) newMeals.snack.push({ id: `mig-${currentLog.date}-snack`, calories: currentLog.meals.snack, dishName: 'Pasto migrato' });
                    if (currentLog.meals.lunch > 0) newMeals.lunch.push({ id: `mig-${currentLog.date}-lunch`, calories: currentLog.meals.lunch, dishName: 'Pasto migrato' });
                    if (currentLog.meals.dinner > 0) newMeals.dinner.push({ id: `mig-${currentLog.date}-dinner`, calories: currentLog.meals.dinner, dishName: 'Pasto migrato' });
                    currentLog = { ...currentLog, meals: newMeals };
                } else if (!currentLog.meals && currentLog.currentCalories > 0) {
                    currentLog = {
                        date: currentLog.date,
                        goalCalories: currentLog.goalCalories,
                        meals: {
                            breakfast: [],
                            snack: [],
                            lunch: [{ id: `mig-${currentLog.date}-lunch`, calories: currentLog.currentCalories, dishName: 'Pasto migrato' }],
                            dinner: [],
                        }
                    };
                }

                // 2. Assicurarsi che `meals` e i suoi array esistano
                if (currentLog.meals) {
                    currentLog.meals = {
                        breakfast: currentLog.meals.breakfast || [],
                        snack: currentLog.meals.snack || [],
                        lunch: currentLog.meals.lunch || [],
                        dinner: currentLog.meals.dinner || [],
                    };
                } else {
                    currentLog = {
                        date: currentLog.date,
                        goalCalories: currentLog.goalCalories || 2000,
                        meals: { breakfast: [], snack: [], lunch: [], dinner: [] }
                    };
                }
                
                // 3. Migrazione di contenuto: aggiungere `dishName` se mancante
                const mealTypes: MealType[] = ['breakfast', 'snack', 'lunch', 'dinner'];
                mealTypes.forEach(mealType => {
                    if (currentLog.meals[mealType] && Array.isArray(currentLog.meals[mealType])) {
                        (currentLog.meals[mealType] as any[]) = currentLog.meals[mealType].map((entry: any) => {
                            if (typeof entry === 'object' && entry !== null && !entry.hasOwnProperty('dishName')) {
                                return { ...entry, dishName: 'Pasto registrato' };
                            }
                            return entry;
                        });
                    }
                });

                return currentLog as DailyLog;
            });
            
            setLogHistory(migratedHistory);
            localStorage.setItem('logHistory', JSON.stringify(migratedHistory));
        }

        const savedWeightHistory = localStorage.getItem('weightHistory');
        if (savedWeightHistory) {
            setWeightHistory(JSON.parse(savedWeightHistory));
        }
      }
    } catch (e) {
      console.error("Errore nel caricamento dati da localStorage", e);
      localStorage.clear(); // Pulisce in caso di dati corrotti
    }
  }, []);

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    setLogHistory([]); // Resetta lo storico quando un nuovo profilo viene salvato
    setWeightHistory([]);
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('logHistory', JSON.stringify([]));
    localStorage.setItem('weightHistory', JSON.stringify([]));
  };

  const handleResetProfile = () => {
    // La conferma è ora gestita nel componente PersonalSpace
    setUserProfile(null);
    setLogHistory([]);
    setWeightHistory([]);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('logHistory');
    localStorage.removeItem('weightHistory');
  };

  const handleAddToLog = (calories: number, mealType: MealType, dishName: string) => {
    if (!userProfile) return;

    const today = new Date().toISOString().split('T')[0];
    const todayLogIndex = logHistory.findIndex(log => log.date === today);
    let newHistory = [...logHistory];

    const newMealEntry: MealEntry = {
        id: `${new Date().getTime()}-${Math.random()}`, // ID unico
        calories: Math.round(calories),
        dishName: dishName,
    };

    if (todayLogIndex > -1) {
        // Aggiorna il log esistente per oggi
        const updatedLog = { ...newHistory[todayLogIndex] };
        // Copia l'array del pasto per evitare mutazioni dirette
        const updatedMealArray = [...(updatedLog.meals[mealType] || [])];
        updatedMealArray.push(newMealEntry);
        updatedLog.meals = { ...updatedLog.meals, [mealType]: updatedMealArray };
        newHistory[todayLogIndex] = updatedLog;
    } else {
        // Crea un nuovo log per oggi
        const goalCalories = calculateDailyGoal(userProfile);
        const newLog: DailyLog = { 
            date: today, 
            goalCalories, 
            meals: { breakfast: [], snack: [], lunch: [], dinner: [] }
        };
        newLog.meals[mealType].push(newMealEntry);
        newHistory.push(newLog);
    }
    setLogHistory(newHistory);
    localStorage.setItem('logHistory', JSON.stringify(newHistory));
  };

  const handleDeleteMeal = (mealType: MealType, mealId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogIndex = logHistory.findIndex(log => log.date === today);

    if (todayLogIndex === -1) return; // Nessun log per oggi

    let newHistory = [...logHistory];
    const logToUpdate = { ...newHistory[todayLogIndex] };
    
    // Filtra l'array del pasto corretto per rimuovere la voce con l'ID corrispondente
    const updatedMealEntries = logToUpdate.meals[mealType].filter(meal => meal.id !== mealId);
    
    const updatedMeals = {
        ...logToUpdate.meals,
        [mealType]: updatedMealEntries
    };

    newHistory[todayLogIndex] = { ...logToUpdate, meals: updatedMeals };

    setLogHistory(newHistory);
    localStorage.setItem('logHistory', JSON.stringify(newHistory));
  };

  const handleUpdateGoalCalories = (calories: number) => {
    if (!userProfile) return;

    const today = new Date().toISOString().split('T')[0];
    const todayLogIndex = logHistory.findIndex(log => log.date === today);
    let newHistory = [...logHistory];

    if (todayLogIndex > -1) {
        // Aggiorna il log esistente per oggi
        const updatedLog = {
            ...newHistory[todayLogIndex],
            goalCalories: calories
        };
        newHistory[todayLogIndex] = updatedLog;
    } else {
        // Crea un nuovo log per oggi se non esiste (caso limite)
        const newLog: DailyLog = { 
            date: today, 
            goalCalories: calories, 
            meals: { breakfast: [], snack: [], lunch: [], dinner: [] }
        };
        newHistory.push(newLog);
    }
    setLogHistory(newHistory);
    localStorage.setItem('logHistory', JSON.stringify(newHistory));
  };

  const handleAddWeightEntry = (weight: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = { date: today, weightKg: weight };

    const existingEntryIndex = weightHistory.findIndex(entry => entry.date === today);
    let updatedHistory = [...weightHistory];

    if (existingEntryIndex > -1) {
        updatedHistory[existingEntryIndex] = newEntry;
    } else {
        updatedHistory.push(newEntry);
    }

    updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setWeightHistory(updatedHistory);
    localStorage.setItem('weightHistory', JSON.stringify(updatedHistory));
  };


  const handleImageSelect = useCallback((selectedImage: { dataUrl: string; mimeType: string; }) => {
    setImage(selectedImage);
    setAnalysisResult(null);
    setError(null);
    setCustomWeight('');
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    setCustomWeight('');

    try {
      const base64Data = image.dataUrl.split(',')[1];
      if (!base64Data) throw new Error("Dati dell'immagine non validi.");
      const result = await analyzeFoodImage(base64Data, image.mimeType);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore imprevisto.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTextAnalyze = async (description: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    setCustomWeight('');
    setImage(null);

    try {
        const result = await analyzeFoodText(description);
        setAnalysisResult(result);
    } catch (err: any) {
        setError(err.message || 'Si è verificato un errore imprevisto.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWeight(e.target.value);
  };

  const handleClear = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setCustomWeight('');
  };

  let recalculatedCalories: number | null = null;
  let recalculatedMacros: { carbs: number | null; proteins: number | null; fats: number | null } = {
    carbs: null,
    proteins: null,
    fats: null
  };
  
  const customWeightNum = parseFloat(customWeight);
  if (analysisResult && analysisResult.estimatedWeightGrams > 0 && !isNaN(customWeightNum) && customWeightNum > 0) {
      const ratio = customWeightNum / analysisResult.estimatedWeightGrams;
      recalculatedCalories = Math.round(analysisResult.calories * ratio);
      recalculatedMacros.carbs = Math.round(analysisResult.carbohydratesGrams * ratio);
      recalculatedMacros.proteins = Math.round(analysisResult.proteinsGrams * ratio);
      recalculatedMacros.fats = Math.round(analysisResult.fatsGrams * ratio);
  }

  // --- Render Logic ---

  if (!userProfile) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <Onboarding onProfileSave={handleProfileSave} />
            <footer className="text-center text-slate-500 dark:text-slate-400 mt-12">
                <p>Powered by Gemini API</p>
            </footer>
        </div>
    );
  }
  
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logHistory.find(log => log.date === today) || {
      date: today,
      goalCalories: calculateDailyGoal(userProfile),
      meals: { breakfast: [], snack: [], lunch: [], dinner: [] }
  };
  
  // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
  // Replaced Object.values().flat() with a more explicit array spread to ensure proper type inference for meal entries, fixing the calculation of consumed calories.
  const consumedCalories = [
    ...(todayLog.meals.breakfast || []),
    ...(todayLog.meals.snack || []),
    ...(todayLog.meals.lunch || []),
    ...(todayLog.meals.dinner || []),
  ].reduce((sum, meal) => sum + meal.calories, 0);

  const renderAnalyzerContent = () => {
    if (isLoading) {
        return <Spinner />;
    }
    if (error) {
        return (
            <div className="w-full flex flex-col items-center space-y-4 animate-fade-in">
                <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Errore: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                <button onClick={handleClear} className="px-8 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-transform transform hover:scale-105">
                    Riprova
                </button>
            </div>
        );
    }
    if (analysisResult) {
        return (
            <div className="w-full flex flex-col items-center space-y-6">
                {image && (
                    <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg animate-fade-in">
                        <img src={image.dataUrl} alt="Cibo analizzato" className="rounded-lg w-full h-auto object-cover aspect-video" />
                    </div>
                )}
                <ResultCard 
                    result={analysisResult} 
                    onWeightChange={handleWeightChange}
                    customWeight={customWeight}
                    recalculatedCalories={recalculatedCalories}
                    recalculatedMacros={recalculatedMacros}
                    onAddToLog={handleAddToLog}
                />
                 <button onClick={handleClear} className="w-full max-w-4xl px-8 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-transform transform hover:scale-105">
                    Nuova Analisi
                </button>
            </div>
        );
    }
    if (image) {
        return (
            <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
                <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                    <img src={image.dataUrl} alt="Cibo da analizzare" className="rounded-lg w-full h-auto object-cover aspect-video" />
                </div>
                <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-4">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto flex-1 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">
                        Analizza Immagine
                    </button>
                    <button onClick={handleClear} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-transform transform hover:scale-105 disabled:opacity-50">
                        Annulla
                    </button>
                </div>
            </div>
        );
    }
    return <ImageInput onImageSelect={handleImageSelect} onTextAnalyze={handleTextAnalyze} />;
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      <main className="w-full max-w-5xl flex flex-col items-center space-y-6 sm:space-y-8">
        <header className="w-full flex justify-center items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Analizzatore di Cibo <span className="text-teal-600 dark:text-teal-400">AI</span>
            </h1>
        </header>

        <nav className="w-full max-w-md flex justify-center bg-slate-200 dark:bg-slate-700 p-1 rounded-lg shadow-inner">
            <button onClick={() => setCurrentView('ANALYZER')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${currentView === 'ANALYZER' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Analizzatore</button>
            <button onClick={() => setCurrentView('PERSONAL_SPACE')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${currentView === 'PERSONAL_SPACE' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Spazio Personale</button>
        </nav>

        {currentView === 'ANALYZER' && (
            <div className="w-full flex flex-col items-center space-y-6 sm:space-y-8">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 text-center mb-4">La Tua Settimana</h2>
                    <WeeklyCalendar logHistory={logHistory} goalCalories={todayLog.goalCalories} />
                </div>
                <DailySummary 
                    goal={todayLog.goalCalories}
                    consumed={consumedCalories}
                />
                {renderAnalyzerContent()}
            </div>
        )}
        
        {currentView === 'PERSONAL_SPACE' && (
            <PersonalSpace 
                userProfile={userProfile}
                dailyLog={todayLog}
                logHistory={logHistory}
                onResetProfile={handleResetProfile}
                isDarkMode={isDarkMode}
                onThemeToggle={handleThemeToggle}
                onUpdateGoalCalories={handleUpdateGoalCalories}
                weightHistory={weightHistory}
                onAddWeightEntry={handleAddWeightEntry}
                onDeleteMeal={handleDeleteMeal}
            />
        )}
      </main>
      <footer className="text-center text-slate-500 dark:text-slate-400 mt-12">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;