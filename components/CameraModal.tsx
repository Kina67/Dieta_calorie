import React, { useRef, useEffect, useCallback, useState } from 'react';

interface CameraModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Errore nell'accesso alla fotocamera:", err);
        let errorMessage = "Impossibile accedere alla fotocamera. Assicurati di aver dato i permessi necessari nel tuo browser e nelle impostazioni di sistema.";
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = "Accesso alla fotocamera negato. Per favore, abilita i permessi per questo sito nelle impostazioni del tuo browser. Potrebbe essere necessario ricaricare la pagina dopo aver concesso l'autorizzazione.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = "Nessuna fotocamera trovata. Assicurati che una fotocamera sia collegata e funzionante.";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = "La fotocamera è già in uso da un'altra applicazione. Chiudi le altre app che potrebbero utilizzarla e riprova.";
        }
        setError(errorMessage);
      }
    };

    const checkPermissionsAndStart = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Il tuo browser non supporta l'accesso alla fotocamera.");
        return;
      }

      // Controllo proattivo con Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            setError("Accesso alla fotocamera bloccato. Devi modificare i permessi per questo sito nelle impostazioni del tuo browser per poter utilizzare la fotocamera.");
            return;
          }
          // Se 'granted' o 'prompt', si procede con getUserMedia
        } catch (permError) {
          console.warn("Impossibile verificare i permessi della fotocamera in anticipo, si procederà normalmente.", permError);
        }
      }
      
      await startCamera();
    };


    checkPermissionsAndStart();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageDataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full h-full flex flex-col overflow-hidden">
        {error ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="text-center p-4 sm:p-8 max-w-lg">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Errore Fotocamera</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                >
                  Chiudi
                </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow relative bg-black">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-contain"
                />
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleCapture}
                    className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  >
                    Scatta Foto
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraModal;