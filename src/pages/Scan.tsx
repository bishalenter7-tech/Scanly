import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Camera, Image as ImageIcon, X, UploadCloud, Loader2, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useScanStore } from '../store/scanStore';
import { useAppStore } from '../store/appStore';
import { analyzeProduct } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

export default function Scan() {
  const navigate = useNavigate();
  const setImage = useScanStore((state) => state.setImage);
  const setAnalyzing = useScanStore((state) => state.setAnalyzing);
  const setResult = useScanStore((state) => state.setResult);
  const setError = useScanStore((state) => state.setError);
  const language = useAppStore((state) => state.language);
  
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

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
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(selectedFile, options);
      setFile(compressedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
        setImage(reader.result as string);
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
      // We now show the EXACT error message the API returned so we can diagnose it!
      setError(`Error: ${err.message}`);
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

      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#064e3b]/90 z-50 flex items-center justify-center backdrop-blur-md p-4"
          >
            {/* Visual Scanning Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
               <div className="relative w-3/4 max-w-sm rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                 <img src={localImage || ''} alt="" className="w-full h-full object-cover grayscale blur-sm" />
                 <motion.div 
                   animate={{ y: ["0%", "100%", "0%"] }}
                   transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                   className="absolute top-0 left-0 right-0 h-1 bg-[#16a34a] shadow-[0_0_20px_4px_rgba(22,163,74,0.8)] z-10"
                 />
                 <motion.div 
                   animate={{ y: ["0%", "100%", "0%"] }}
                   transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                   className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#16a34a]/40 mix-blend-overlay z-0"
                 />
               </div>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 relative z-20"
            >
              <div className="flex justify-center">
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center justify-center text-[#16a34a]">
                     <Search size={32} />
                   </div>
                   <div className="w-24 h-24 border-4 border-[#16a34a]/10 rounded-full animate-spin"></div>
                   <div className="w-24 h-24 border-4 border-[#16a34a] rounded-full animate-spin absolute top-0 left-0 border-t-transparent border-r-transparent drop-shadow-[0_0_10px_rgba(22, 163, 74,0.5)]"></div>
                 </div>
              </div>
              
              <div className="space-y-4 bg-[#f0fdf4] p-5 rounded-2xl border border-[#16a34a]/5 h-56 overflow-y-auto custom-scrollbar">
                <LoadingStep active={loadingStep >= 0} text="🔍 Extracting text & symbols..." />
                <LoadingStep active={loadingStep >= 1} text="🤖 AI Model processing logic..." />
                <LoadingStep active={loadingStep >= 2} text="🌐 Cross-referencing Google..." />
                <LoadingStep active={loadingStep >= 3} text="🧪 Analyzing toxicology..." />
                <LoadingStep active={loadingStep >= 4} text="⚖️ Checking marketing claims..." />
                <LoadingStep active={loadingStep >= 5} text="📊 Building detailed report..." />
              </div>

              <p className="text-center text-xs font-semibold text-[#16a34a] animate-pulse">This usually takes 20–30 seconds</p>
            </motion.div>
          </motion.div>
        )}
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
