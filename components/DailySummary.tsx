import React from 'react';

interface DailySummaryProps {
  goal: number;
  consumed: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ goal, consumed }) => {
  const isOverGoal = consumed > goal;
  const remaining = goal - consumed;
  
  const progressPercentageRaw = goal > 0 ? (consumed / goal) * 100 : 0;
  const progressPercentageCapped = Math.min(progressPercentageRaw, 100);
  const progressBarColor = isOverGoal ? 'bg-red-500' : 'bg-teal-500';

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 text-center mb-4">Riepilogo Giornaliero</h2>
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Obiettivo</p>
          <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{goal} <span className="text-sm font-normal">kcal</span></p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consumate</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{consumed} <span className="text-sm font-normal">kcal</span></p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{isOverGoal ? 'Eccesso' : 'Rimanenti'}</p>
          <p className={`text-xl font-bold ${isOverGoal ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{Math.abs(remaining)} <span className="text-sm font-normal">kcal</span></p>
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div
          className={`${progressBarColor} h-3 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentageCapped}%` }}
          role="progressbar"
          aria-valuenow={consumed}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`${Math.round(progressPercentageRaw)}% del tuo obiettivo giornaliero`}
        ></div>
      </div>
    </div>
  );
};

export default DailySummary;