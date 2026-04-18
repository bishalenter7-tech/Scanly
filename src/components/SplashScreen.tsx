import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void; key?: string }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow time for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#064e3b] overflow-hidden"
        >
          {/* Background Particles/Circles */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.1, 0] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            className="absolute w-96 h-96 bg-[#16a34a] rounded-full blur-3xl"
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="w-32 h-32 mb-8 shadow-2xl relative z-10"
          >
            <img src="/src/logo.svg" alt="Scanly Logo" className="w-full h-full object-contain" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white text-5xl font-extrabold tracking-tight relative z-10"
          >
            Scanly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-gray-300 mt-4 text-lg font-medium tracking-wide relative z-10"
          >
            Scan. Analyze. Know the Truth.
          </motion.p>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
            className="h-1 w-48 bg-white/20 rounded-full mt-12 overflow-hidden relative z-10"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="h-full w-1/2 bg-[#16a34a] rounded-full shadow-[0_0_10px_rgba(22, 163, 74,0.8)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
