import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';

export function usePushReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      if ((window as any).OneSignalDeferred) {
        (window as any).OneSignalDeferred.push(function(OneSignal: any) {
          if (OneSignal.Notifications.permission === 'granted') {
            setPermissionGranted(true);
          }
        });
      }
    };

    checkPermission();

    const timer = setTimeout(() => {
      if (!permissionGranted) {
        setShowReminder(true);
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [permissionGranted]);

  useEffect(() => {
    if (showReminder) {
      const dismissTimer = setTimeout(() => {
        setShowReminder(false);
        if (!permissionGranted) {
          setTimeout(() => setShowReminder(true), 60000);
        }
      }, 10000);

      return () => clearTimeout(dismissTimer);
    }
  }, [showReminder, permissionGranted]);

  const handleAllow = () => {
    if ((window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(function(OneSignal: any) {
        OneSignal.Slidedown.promptPush();
      });
    }
    setShowReminder(false);
    setPermissionGranted(true);
  };

  const handleDismiss = () => {
    setShowReminder(false);
    if (!permissionGranted) {
      setTimeout(() => setShowReminder(true), 60000);
    }
  };

  return { showReminder, handleAllow, handleDismiss, permissionGranted };
}

export function PushReminderToast() {
  const { showReminder, handleAllow, handleDismiss, permissionGranted } = usePushReminder();

  if (permissionGranted) return null;

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16a34a] to-[#22c55e]" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#16a34a]/10 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-[#16a34a]" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="font-bold text-[#064e3b] mb-1">Enable Notifications</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Stay healthy! Get weekly food alerts and free scan refills delivered to your device.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleAllow}
                className="flex-1 bg-[#16a34a] hover:bg-[#15803d] rounded-xl"
              >
                <Bell className="h-4 w-4 mr-2" />
                Allow
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}