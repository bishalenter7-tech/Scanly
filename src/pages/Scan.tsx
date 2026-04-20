import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Camera, Image as ImageIcon, X, UploadCloud, Loader2, Search, Tv } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useScanStore } from '../store/scanStore';
import { analyzeProduct } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

export default function Scan() {
  const navigate = useNavigate();
  const setImage = useScanStore((state) => state.setImage);
  const setAnalyzing = useScanStore((state) => state.setAnalyzing);
  const setResult = useScanStore((state) => state.setResult);
  const setError = useScanStore((state) => state.setError);
  const language = useScanStore((state) => state.language);
  
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showOutOfScansModal, setShowOutOfScansModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(15);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const checkAndResetScans = useScanStore((state) => state.checkAndResetScans);
  const useScan = useScanStore((state) => state.useScan);
  const rewardScan = useScanStore((state) => state.rewardScan);
const freeScansLimit = useScanStore((state) => state.freeScansLimit);

  // Countdown timer effect for ad watching
  useEffect(() => {
    if (isWatchingAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (isWatchingAd && adCountdown === 0) {
      rewardScan();
      setShowOutOfScansModal(false);
      setIsWatchingAd(false);
      setAdCountdown(15);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  }, [isWatchingAd, adCountdown, rewardScan]);

  // Watch ad and unlock scan
  const handleWatchAd = () => {
    window.open('https://omg10.com/4/10899914', '_blank');
    setIsWatchingAd(true);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelection(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10485760, // 10MB
  } as any);

   const handleFileSelection = async (selectedFile: File) => {
     try {
       // Clear previous result immediately to prevent UI flashing
       setResult(null);
       
       const options = {
         maxSizeMB: 1,
         maxWidthOrHeight: 1200,
         useWebWorker: true,
       };
       
       const compressedFile = await imageCompression(selectedFile, options);
       setFile(compressedFile);
       
       const reader = new FileReader();
       reader.onload = () => {
         const result = reader.result as string;
         setLocalImage(result);
         setImage(result);
       };
       reader.readAsDataURL(compressedFile);
     } catch (e) {
       console.error("Compression error:", e);
     }
   };

const handleAnalyze = async () => {
      if (!localImage || !file) {
        setError("Please select an image first");
        return;
      }
      
      // Check and reset scans if 24h have passed, or show modal if limit reached
      const canScan = checkAndResetScans();
      if (!canScan) {
        setShowOutOfScansModal(true);
        return;
      }
      
      // Use one scan credit
      useScan();
      
      // Clear previous result immediately to prevent UI flashing
      setResult(null);
      
      setIsProcessing(true);
      setAnalyzing(true);
      setError(null);
      setLoadingStep(1);

    const stepsInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 5 ? prev + 1 : prev));
    }, 2800);

    try {
      const base64Data = localImage.split(',')[1];
      const result = await analyzeProduct(base64Data, file.type, language || 'English');
      
      setResult(result);
      useScanStore.getState().saveToHistory(result, localImage);
      
      clearInterval(stepsInterval);
      navigate('/results');
    } catch (err: any) {
      console.error(err);
      // Handle specific error types with user-friendly messages
      if (err.name === 'HIGH_DEMAND' || err.message.includes('high traffic') || err.message.includes('503')) {
        setError('⏳ AI Servers are currently experiencing high traffic. Please tap Analyze to try again in a few seconds.');
      } else {
        setError(`Error: ${err.message}`);
      }
      setIsProcessing(false);
      setAnalyzing(false);
      clearInterval(stepsInterval);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-8 relative"
    >
      <h1 className="text-3xl font-bold text-center mb-2 text-[#064e3b]">Scan Product for Scanly</h1>
      <p className="text-center text-[#6B7280] mb-8">Take a photo or upload an image to analyze the product.</p>

      <AnimatePresence mode="wait">
        {!localImage ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div 
              {...getRootProps()} 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input[type="file"]');
                if (input) (input as HTMLInputElement).value = '';
              }}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm ${isDragActive ? 'border-[#16a34a] bg-[#16a34a]/5 scale-[1.02]' : 'border-[#16a34a]/20 hover:border-[#16a34a]/50 bg-white hover:bg-[#16a34a]/[0.02]'}`}
              style={{ minHeight: '300px' }}
            >
              <input {...getInputProps()} />
              <motion.div animate={isDragActive ? { y: -10 } : { y: 0 }}>
                <UploadCloud className="h-16 w-16 text-[#16a34a] mb-4 drop-shadow-md" />
              </motion.div>
              <p className="text-lg font-medium text-center mb-1 text-[#064e3b]">Drag & drop your product photo here</p>
              <p className="text-sm text-gray-500 mb-6">or</p>
              <div className="grid grid-cols-2 gap-4 w-full">
                {/* Gallery Upload */}
                <Button 
                  type="button" 
                  className="bg-white text-[#16a34a] border-2 border-[#16a34a] hover:bg-[#16a34a]/5 shadow-sm rounded-xl py-8 flex flex-col gap-2"
                  onClick={() => document.getElementById('gallery-input')?.click()}
                >
                  <UploadCloud className="h-8 w-8" />
                  <span className="font-bold">Gallery</span>
                  <input 
                    id="gallery-input"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onClick={(e) => (e.currentTarget.value = '')}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelection(e.target.files[0]);
                        e.target.value = '';
                      }
                    }} 
                  />
                </Button>

                {/* Camera Launch */}
                <Button 
                  type="button" 
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-[#16a34a]/20 rounded-xl py-8 flex flex-col gap-2"
                  onClick={() => document.getElementById('camera-input')?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span className="font-bold">Camera</span>
                  <input 
                    id="camera-input"
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onClick={(e) => (e.currentTarget.value = '')}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelection(e.target.files[0]);
                        e.target.value = '';
                      }
                    }} 
                  />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-6">JPG, PNG, WEBP — Max 10MB</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#16a34a]/10 p-4 flex flex-col items-center"
          >
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-[#f0fdf4] flex items-center justify-center border border-[#16a34a]/10">
              <img src={localImage} alt="Product Preview" className="max-h-[500px] object-contain shadow-sm" />
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute top-3 right-3 rounded-full opacity-90 hover:opacity-100 shadow-lg z-20"
                onClick={() => {
                  setLocalImage(null);
                  setFile(null);
                  setImage(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 w-full max-w-md space-y-4">
               {useScanStore.getState().error && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-xl border border-red-100">
                  {useScanStore.getState().error}
                </motion.p>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] h-14 text-lg shadow-xl shadow-[#16a34a]/20 rounded-xl"
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Thinking...' : 'Analyze This Product →'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Out of Scans Modal */}
      <AnimatePresence>
        {showOutOfScansModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { if (!isWatchingAd) setShowOutOfScansModal(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#16a34a]/20 z-10"
            >
              <div className="text-center">
                {isWatchingAd ? (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-6xl mb-4"
                    >
                      ⏳
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#064e3b] mb-2">
                      Unlocking in {adCountdown} seconds...
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Please hold on. Your scan will be unlocked automatically.
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${((15 - adCountdown) / 15) * 100}%` }}
                        className="h-full bg-[#16a34a]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div 
                      initial={{ y: -10 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-6xl mb-4"
                    >
                      🚀
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#064e3b] mb-2">
                      Wow, you're a scanning pro!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You've used your 2 free daily scans. No worries though—you can unlock another scan right now by watching a quick ad, or come back tomorrow for a free refill!
                    </p>
                    <Button 
                      onClick={handleWatchAd}
                      className="w-full bg-[#16a34a] hover:bg-[#15803d] h-14 text-lg font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Tv className="h-5 w-5" />
                      Watch Ad to Unlock
                    </Button>
                    <button 
                      onClick={() => setShowOutOfScansModal(false)}
                      className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600"
                    >
                      Maybe later
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white py-3 px-6 rounded-full font-medium shadow-lg"
          >
            Scan Unlocked! You're good to go.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Loading Skeleton - Mimics Results Page */}
      <AnimatePresence>
        {isProcessing && <ResultsSkeleton />}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingStep({ active, text }: { active: boolean, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0.3, x: -10 }}
      animate={active ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -10 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <div className={`h-2.5 w-2.5 rounded-full shadow-sm flex-shrink-0 ${active ? 'bg-[#16a34a] shadow-[#16a34a]/40' : 'bg-gray-200'}`}></div>
      <span className={`text-sm font-semibold tracking-wide leading-tight ${active ? 'text-[#064e3b]' : 'text-gray-400'}`}>{text}</span>
    </motion.div>
  );
}

function ResultsSkeleton() {
  const [statusIndex, setStatusIndex] = useState(0);
  const aiTasks = [
    { icon: "🔗", text: "Connecting to Global Food Databases..." },
    { icon: "🔬", text: "Cross-referencing chemical compounds..." },
    { icon: "📋", text: "Checking FDA safety limits..." },
    { icon: "⚖️", text: "Analyzing user dietary risks..." },
    { icon: "🧬", text: "Decoding ingredient interactions..." },
    { icon: "🏥", text: "Comparing with medical guidelines..." },
    { icon: "📊", text: "Generating nutrition insights..." },
    { icon: "🔍", text: "Validating product authenticity..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % aiTasks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [aiTasks.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#f0fdf4] z-50 overflow-y-auto"
    >
      {/* Warning Banner */}
      <div className="bg-red-500 text-white py-3 px-4 text-center font-bold sticky top-0 z-10 shadow-lg">
        ⚠️ Please do not close this tab or leave the app. Analysis in progress...
      </div>

      {/* Header Skeleton */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
        </div>
      </div>

      {/* AI Processing Feed */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-[#064e3b] to-[#16a34a] rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl"
                >
                  {aiTasks[statusIndex].icon}
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Processing</h3>
                  <p className="text-green-100 text-sm">{aiTasks[statusIndex].text}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {aiTasks.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i === statusIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Monetag Ad Space */}
        <div className="w-full flex justify-center py-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center w-full max-w-lg">
            <p className="text-gray-400 text-sm">Advertisement Space</p>
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border p-6 flex flex-col lg:flex-row gap-8"
        >
          {/* Product Image Placeholder */}
          <div className="flex-shrink-0 w-32 h-32 lg:w-48 lg:h-48 rounded-xl bg-gray-200 animate-pulse" />
          
          {/* Title, Brand, Badges */}
          <div className="flex-1 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="h-8 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-5 w-1/2 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
            {/* Safety Gauge Circle */}
            <div className="flex items-center justify-center">
              <div className="w-[140px] h-[140px] rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Summary Section Skeleton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 p-6 bg-white border rounded-2xl shadow-sm">
            <div className="h-6 w-48 bg-gray-200 rounded-xl animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="p-6 bg-white border rounded-2xl shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded-xl animate-pulse mb-4" />
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </motion.div>

        {/* Charts & Advice Skeleton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Radar Chart Placeholder */}
          <div className="lg:col-span-1 p-6 bg-white border rounded-2xl shadow-sm">
            <div className="h-6 w-40 bg-gray-200 rounded-xl animate-pulse mb-4" />
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          
          {/* Dietary Advice Placeholder */}
          <div className="lg:col-span-2 p-6 bg-white border rounded-2xl shadow-sm">
            <div className="h-6 w-48 bg-gray-200 rounded-xl animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Ingredients Breakdown Skeleton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-6 w-48 bg-gray-200 rounded-xl animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="h-5 w-2/3 bg-gray-200 rounded-xl animate-pulse mb-2" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-4"
        >
          <div className="max-w-5xl mx-auto">
            <div className="h-12 bg-[#16a34a]/10 rounded-xl animate-pulse flex items-center justify-center">
              <span className="text-[#16a34a] font-medium">Processing your scan...</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
