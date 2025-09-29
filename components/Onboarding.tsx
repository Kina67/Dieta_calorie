import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';

interface OnboardingProps {
  onProfileSave: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onProfileSave }) => {
  const [formData, setFormData] = useState({
    gender: 'female' as Gender,
    age: '30',
    weightKg: '70',
    heightCm: '170',
    activityLevel: 'light' as ActivityLevel,
    goalWeightKg: '65',
    goalTimeframeMonths: '6',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age, 10);
    const weightKg = parseFloat(formData.weightKg);
    const heightCm = parseInt(formData.heightCm, 10);
    const goalWeightKg = parseFloat(formData.goalWeightKg);
    const goalTimeframeMonths = parseInt(formData.goalTimeframeMonths, 10);

    if (isNaN(age) || isNaN(weightKg) || isNaN(heightCm) || isNaN(goalWeightKg) || isNaN(goalTimeframeMonths) || age <= 0 || weightKg <= 0 || heightCm <= 0 || goalWeightKg <= 0 || goalTimeframeMonths <= 0) {
      setError('Per favore, inserisci valori validi e positivi in tutti i campi.');
      return;
    }
    setError('');
    
    // Rimuoviamo il vecchio campo `goal` e passiamo i nuovi dati
    const { ...profileData } = formData;

    onProfileSave({
      ...profileData,
      age,
      weightKg,
      heightCm,
      goalWeightKg,
      goalTimeframeMonths,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">Crea il Tuo Spazio Personale</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Inserisci i tuoi dati per calcolare un piano calorico su misura per i tuoi obiettivi.</p>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-600 dark:text-red-400 p-4 mb-6 rounded" role="alert"><p>{error}</p></div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sesso</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500">
                <option value="female">Donna</option>
                <option value="male">Uomo</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Età</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peso Attuale (kg)</label>
              <input type="number" step="0.1" id="weightKg" name="weightKg" value={formData.weightKg} onChange={handleChange} required className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="heightCm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Altezza (cm)</label>
              <input type="number" id="heightCm" name="heightCm" value={formData.heightCm} onChange={handleChange} required className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Livello di Attività Fisica</label>
            <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500">
              <option value="sedentary">Sedentario (poco o nessun esercizio)</option>
              <option value="light">Leggero (esercizio 1-3 volte/settimana)</option>
              <option value="moderate">Moderato (esercizio 3-5 volte/settimana)</option>
              <option value="active">Attivo (esercizio 6-7 volte/settimana)</option>
              <option value="very_active">Molto Attivo (lavoro fisico + esercizio)</option>
            </select>
          </div>
           <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
             <p className="text-center font-semibold text-slate-700 dark:text-slate-300 mb-4">Definisci il Tuo Obiettivo</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="goalWeightKg" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peso Obiettivo (kg)</label>
                    <input type="number" step="0.1" id="goalWeightKg" name="goalWeightKg" value={formData.goalWeightKg} onChange={handleChange} required className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                    <label htmlFor="goalTimeframeMonths" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tempistica (mesi)</label>
                    <input type="number" id="goalTimeframeMonths" name="goalTimeframeMonths" value={formData.goalTimeframeMonths} onChange={handleChange} required className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500" />
                </div>
             </div>
           </div>
          <button type="submit" className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 dark:hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Salva Profilo e Inizia
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
