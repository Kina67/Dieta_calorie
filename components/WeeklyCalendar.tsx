import React from 'react';
import { DailyLog, MealEntry } from '../types';

interface WeeklyCalendarProps {
  logHistory: DailyLog[];
  goalCalories: number;
}

const GreenCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RedXIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NeutralDotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
    </svg>
);


const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ logHistory, goalCalories }) => {
  const weekDays = [];
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dateString = date.toISOString().split('T')[0];
    const dayLog = logHistory.find(log => log.date === dateString);
    
    let statusIcon = <NeutralDotIcon />;
    if (dayLog) {
      const { meals, goalCalories: logGoal } = dayLog;
      // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
      // Replaced Object.values().flat() with a more explicit array spread to ensure proper type inference for meal entries.
      const currentCalories = [
        ...(meals.breakfast || []),
        ...(meals.snack || []),
        ...(meals.lunch || []),
        ...(meals.dinner || []),
      ].reduce((sum, meal) => sum + meal.calories, 0);

      if (currentCalories > logGoal) {
        statusIcon = <RedXIcon />;
      } else if (currentCalories > 0) {
        statusIcon = <GreenCheckIcon />;
      }
    }
    
    const isToday = i === 0;

    weekDays.push({
      date: date.getDate(),
      dayName: dayNames[date.getDay()],
      isToday: isToday,
      statusIcon: statusIcon
    });
  }

  return (
    <div className="flex justify-around items-center">
      {weekDays.map((day, index) => (
        <div key={index} className={`flex flex-col items-center p-2 rounded-lg ${day.isToday ? 'bg-teal-100 dark:bg-teal-900/50' : ''}`}>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{day.dayName}</span>
          <span className={`text-lg font-bold ${day.isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}`}>{day.date}</span>
          <div className="mt-2 h-6 w-6">
            {day.statusIcon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendar;