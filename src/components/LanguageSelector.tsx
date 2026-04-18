import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';

const languages = [
  { code: 'English', name: 'English', flag: '🇬🇧/🇺🇸' },
  { code: 'Hindi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'Bengali', name: 'বাংলা (Bengali)', flag: '🇮🇳/🇧🇩' },
  { code: 'Japanese', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'Chinese', name: '中文 (Chinese)', flag: '🇨🇳' },
];

export default function LanguageSelector({ onComplete }: { onComplete: () => void; key?: string }) {
  const { setLanguage } = useAppStore();

  const handleSelect = (lang: string) => {
    setLanguage(lang);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f0fdf4] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#16a34a]/10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#16a34a]/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🌐</span>
          </div>
          <h2 className="text-2xl font-bold text-[#064e3b]">Select Language</h2>
          <p className="text-gray-500 mt-2">Choose your preferred language for analysis</p>
        </div>

        <div className="space-y-3">
          {languages.map((lang, idx) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#16a34a]/30 hover:bg-[#16a34a]/5 transition-all text-left"
            >
              <span className="font-semibold text-gray-800">{lang.name}</span>
              <span className="text-xl">{lang.flag}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
