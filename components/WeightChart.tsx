import React from 'react';
import { WeightEntry } from '../types';

interface WeightChartProps {
  history: WeightEntry[];
  startWeight: number;
  goalWeight: number;
}

const WeightChart: React.FC<WeightChartProps> = ({ history, startWeight, goalWeight }) => {
  if (history.length < 2) {
    return (
      <div className="text-center p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">Registra il tuo peso almeno due volte per visualizzare l'andamento nel tempo.</p>
      </div>
    );
  }

  const allWeights = [startWeight, goalWeight, ...history.map(h => h.weightKg)];
  const minWeight = Math.min(...allWeights);
  const maxWeight = Math.max(...allWeights);
  const weightRange = maxWeight - minWeight;
  
  // Aggiungi un po' di padding per evitare che i punti tocchino i bordi
  const yPadding = weightRange * 0.1 > 0 ? weightRange * 0.1 : 1; 
  const yMin = minWeight - yPadding;
  const yMax = maxWeight + yPadding;
  const yRange = yMax - yMin;

  const firstDate = new Date(history[0].date).getTime();
  const lastDate = new Date(history[history.length - 1].date).getTime();
  const dateRange = lastDate - firstDate;

  const width = 500;
  const height = 200;
  const xPadding = 30;
  const yPaddingTop = 20;
  const yPaddingBottom = 20;

  const toX = (date: string) => {
    if (dateRange === 0) return xPadding + (width - 2 * xPadding) / 2; // Center if only one date range
    const time = new Date(date).getTime();
    return xPadding + ((time - firstDate) / dateRange) * (width - 2 * xPadding);
  };
  
  const toY = (weight: number) => {
    return yPaddingTop + height - ((weight - yMin) / yRange) * height;
  };
  
  const pathData = history
    .map((entry, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${toX(entry.date)} ${toY(entry.weightKg)}`;
    })
    .join(' ');

  const goalLineY = toY(goalWeight);
  const startLineY = toY(startWeight);
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height + yPaddingBottom + yPaddingTop}`} className="w-full h-auto" role="img" aria-labelledby="weight-chart-title">
        <title id="weight-chart-title">Grafico dell'andamento del peso</title>
        
        {/* Goal Line */}
        <line x1={xPadding} y1={goalLineY} x2={width - xPadding} y2={goalLineY} strokeDasharray="4" className="stroke-teal-500" strokeWidth="1" />
        <text x={width - xPadding + 5} y={goalLineY + 3} className="fill-teal-600 dark:fill-teal-400 text-xs font-semibold">Obiettivo: {goalWeight} kg</text>

        {/* Start Line */}
        <line x1={xPadding} y1={startLineY} x2={width - xPadding} y2={startLineY} strokeDasharray="4" className="stroke-slate-400" strokeWidth="1" />
        <text x={xPadding - 5} y={startLineY + 3} textAnchor="end" className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">{startWeight} kg</text>
        
        {/* Weight Path */}
        <path d={pathData} fill="none" className="stroke-indigo-500" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data Points and Tooltips */}
        {history.map((entry, index) => (
          <g key={index} className="group">
            <circle cx={toX(entry.date)} cy={toY(entry.weightKg)} r="3" className="fill-indigo-500" />
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <rect x={toX(entry.date) - 25} y={toY(entry.weightKg) - 28} width="50" height="20" rx="4" className="fill-slate-800" />
               <text x={toX(entry.date)} y={toY(entry.weightKg) - 15} textAnchor="middle" className="fill-white font-semibold text-xs">{entry.weightKg}kg</text>
            </g>
          </g>
        ))}

        {/* X Axis Labels */}
        <text x={toX(history[0].date)} y={height + yPaddingBottom + yPaddingTop - 5} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-xs">{formatDate(history[0].date)}</text>
        <text x={toX(history[history.length - 1].date)} y={height + yPaddingBottom + yPaddingTop - 5} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-xs">{formatDate(history[history.length - 1].date)}</text>
      </svg>
    </div>
  );
};

export default WeightChart;