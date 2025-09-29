import React, { useState, useRef } from 'react';
import CameraModal from './CameraModal';

interface ImageInputProps {
  onImageSelect: (image: { dataUrl: string; mimeType: string; }) => void;
  onTextAnalyze: (description: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TextIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);


const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, onTextAnalyze }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelect({ dataUrl: e.target.result as string, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageDataUrl: string) => {
    onImageSelect({ dataUrl: imageDataUrl, mimeType: 'image/jpeg' });
    setIsCameraOpen(false);
  };
  
  const handleTextSubmit = () => {
    if (textInput.trim()) {
        onTextAnalyze(textInput.trim());
    }
  };
  
  if (isTextMode) {
    return (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 text-center">Descrivi il tuo pasto</h2>
            <p className="text-center text-slate-500 dark:text-slate-400">Inserisci i dettagli del cibo che hai mangiato. Esempio: "un piatto di pasta al pomodoro, circa 120g".</p>
            <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Es. verdura cotta 150 grammi"
                className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500"
                aria-label="Descrizione del pasto"
            />
            <div className="w-full flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="w-full flex-1 flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Analizza Descrizione
                </button>
                 <button
                    onClick={() => setIsTextMode(false)}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                >
                    Indietro
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center space-y-6">
       <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 text-center">Inizia da qui</h2>
      <p className="text-center text-slate-500 dark:text-slate-400">Scegli un'opzione per l'analisi</p>
      <div className="w-full flex flex-col space-y-4">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
        <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
            <UploadIcon />
            Carica un File
        </button>
        <button
            onClick={() => setIsCameraOpen(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
            <CameraIcon />
            Usa la Fotocamera
        </button>
        <button
            onClick={() => setIsTextMode(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
            <TextIcon />
            Descrivi cosa mangi
        </button>
      </div>
      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};

export default ImageInput;