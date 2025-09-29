import React from 'react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
        isDarkMode ? 'bg-teal-600' : 'bg-slate-300'
      }`}
      aria-pressed={isDarkMode}
    >
      <span className="sr-only">Attiva tema scuro</span>
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default DarkModeToggle;