import React from 'react';
import { DailyLog, MealEntry } from '../types';

interface WeeklyChartProps {
  logHistory: DailyLog[];
  goalCalories: number;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ logHistory, goalCalories }) => {
  const weekData = [];
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const dayLog = logHistory.find(log => log.date === dateString);

    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
    // Replaced Object.values().flat() with a more explicit array spread to ensure proper type inference for meal entries.
    const consumed = dayLog
      ? [
          ...(dayLog.meals.breakfast || []),
          ...(dayLog.meals.snack || []),
          ...(dayLog.meals.lunch || []),
          ...(dayLog.meals.dinner || []),
        ].reduce((sum, meal) => sum + meal.calories, 0)
      : 0;

    weekData.push({
      dayName: dayNames[date.getDay()],
      consumed: consumed,
      goal: dayLog?.goalCalories ?? goalCalories,
      isToday: i === 0,
    });
  }

  const maxCalories = Math.max(
    ...weekData.map(d => d.consumed),
    goalCalories
  );
  // Aggiunge un 20% di margine all'asse Y del grafico
  const chartMaxY = maxCalories * 1.2; 
  // Evita la divisione per zero se tutti i valori sono 0
  const yAxisHeight = chartMaxY === 0 ? 1 : chartMaxY;

  const goalLinePosition = (goalCalories / yAxisHeight) * 100;

  return (
    <div className="w-full">
      <div className="relative h-64 w-full flex items-end justify-around gap-2 border-l border-b border-slate-200 dark:border-slate-700 p-2">
        {/* Linea Obiettivo */}
        {goalCalories > 0 && (
          <div
            className="absolute w-full border-t-2 border-dashed border-teal-500"
            style={{ bottom: `${goalLinePosition}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-3 right-0 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 px-1">
              {goalCalories} kcal
            </span>
          </div>
        )}
        
        {/* Barre */}
        {weekData.map((day, index) => {
          const barHeight = (day.consumed / yAxisHeight) * 100;
          const barColor = day.consumed > day.goal ? 'bg-red-400' : 'bg-green-400';

          return (
            <div key={index} className="flex-1 h-full flex items-end justify-center group relative" role="figure" aria-label={`Giorno: ${day.dayName}, Consumate: ${day.consumed} kcal`}>
              <div
                className={`w-3/4 max-w-8 rounded-t-sm transition-all duration-300 ease-out ${barColor}`}
                style={{ height: `${barHeight}%` }}
              ></div>
              <div className="absolute -bottom-10 text-center w-full">
                 <span className={`text-xs font-semibold ${day.isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {day.dayName}
                </span>
              </div>
               {/* Tooltip */}
              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" role="tooltip">
                {day.consumed} kcal
                <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </div>
            </div>
          );
        })}
      </div>
       <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-10">Passa il mouse sopra le barre per vedere i dettagli.</p>
    </div>
  );
};

export default WeeklyChart;