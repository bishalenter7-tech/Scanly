import { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function InstallPrompt() {
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let notificationTimer: NodeJS.Timeout;
    
    if (isLoggedIn && "Notification" in window && Notification.permission === "default") {
      notificationTimer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission result:", permission);
        });
      }, 30000);
    }
    
    return () => {
      if (notificationTimer) clearTimeout(notificationTimer);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    let installTimer: NodeJS.Timeout;
    
    if (isInstallable && isLoggedIn) {
      installTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 40000);
    }
    
    return () => {
      if (installTimer) clearTimeout(installTimer);
    };
  }, [isInstallable, isLoggedIn]);

  const handleInstallClick = async () => {
    setShowPrompt(false); 
    await triggerInstall();
  };

  if (!isInstallable || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl border-t border-gray-100 dark:border-gray-800 transition-transform duration-500">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <img src="/Scanly.png" alt="Scanly" className="w-12 h-12 rounded-xl shadow-sm border border-gray-200" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Install Scanly App</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fast, offline & securely on your home screen!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPrompt(false)} 
            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            Later
          </button>
          <button 
            onClick={handleInstallClick} 
            className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}