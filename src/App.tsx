import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Camera, Search, Settings as SettingsIcon, History as HistoryIcon, Info, LogOut, Menu, X, ShieldCheck, AlertCircle, Sparkles, Download, Smartphone } from 'lucide-react';
import Landing from './pages/Landing';
import Scan from './pages/Scan';
import Results from './pages/Results';
import History from './pages/History';
import About from './pages/About';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import SplashScreen from './components/SplashScreen';
import LanguageSelector from './components/LanguageSelector';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { useScanStore } from './store/scanStore';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Button } from './components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

function AuthErrorToast() {
  const error = useAuthStore((state) => state.error);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  
  if (!error) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
    >
       <div className="flex items-start gap-3">
         <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
         <div className="flex-1">
           <h4 className="font-bold text-red-600 text-sm mb-1">Login Blocked by Settings</h4>
           <p className="text-xs text-gray-600 leading-relaxed">{error}</p>
         </div>
       </div>
       {error.includes('unauthorized-domain') && (
         <div className="flex justify-end pt-2 border-t border-red-50">
           <Button onClick={() => window.open(window.location.href, '_blank')} size="sm" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200">
              Open in New Window
           </Button>
         </div>
       )}
    </motion.div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex-1 flex flex-col bg-[#f0fdf4] w-full min-h-screen origin-center"
      initial={{ clipPath: 'circle(0% at 50% 50%)', filter: 'brightness(0.5)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', filter: 'brightness(1)' }}
      exit={{ clipPath: 'circle(0% at 50% 50%)', filter: 'brightness(0)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LoginScreen() {
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f0fdf4] relative overflow-hidden min-h-[calc(100vh-64px)] w-full">
       <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#16a34a] blur-[120px] rounded-full opacity-20 pointer-events-none" />
       <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#047857] blur-[100px] rounded-full opacity-20 pointer-events-none" />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="w-full max-w-md bg-gradient-to-br from-[#16a34a] to-[#047857] p-1 rounded-[2.5rem] shadow-2xl relative z-10"
       >
          <div className="bg-[#022c22] p-8 rounded-[2.4rem] flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#16a34a]/20 text-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-[#16a34a]/30">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Access Required</h2>
            <p className="text-green-100/80 mb-8 leading-relaxed text-sm px-2">
              To unlock AI scanning, view history, or modify settings, please sign in securely.
            </p>
            
            <div className="w-full bg-[#064e3b] rounded-2xl p-5 mb-8 text-left border border-[#16a34a]/20 shadow-inner">
               <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#22c55e]" />
                  Why Google Login?
               </h3>
               <ul className="text-green-100/80 text-[13px] space-y-3">
                 <li className="flex items-start gap-2 leading-tight">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                    <span><strong>Zero Passwords:</strong> Never remember or reset a password again.</span>
                 </li>
                 <li className="flex items-start gap-2 leading-tight">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                    <span><strong>Ironclad Security:</strong> Backed by Google's industry-leading safety protocols.</span>
                 </li>
                 <li className="flex items-start gap-2 leading-tight">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                    <span><strong>Cloud Sync:</strong> Your history travels seamlessly across all devices.</span>
                 </li>
               </ul>
            </div>

            <div className="flex flex-col gap-5 w-full">
              <Button onClick={loginWithGoogle} className="w-full bg-white hover:bg-gray-50 text-[#064e3b] py-7 rounded-2xl text-[17px] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 transition-transform active:scale-95 border-2 border-transparent hover:border-[#22c55e]">
                 <svg viewBox="0 0 24 24" className="w-6 h-6">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 Sign in to Continue
              </Button>
<p className="text-[11px] text-[#16a34a] font-medium px-4 leading-relaxed tracking-wide">
                 By signing in, I agree to TruthScan AI's <a href="[https://www.termsfeed.com/live/afe2dceb-42ff-4b91-98fa-ea54fd1b0184]" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Terms & Conditions</a> and <a href="[https://www.termsfeed.com/live/8d7f12ef-5462-45f6-a825-7887e2d923c3]" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Privacy Policy</a>.
               </p>
            </div>
          </div>
       </motion.div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - TS complains about key on Routes but framer-motion needs it */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginScreen /></PageTransition>} />
        <Route path="/scan" element={<PageTransition><ProtectedRoute><Scan /></ProtectedRoute></PageTransition>} />
        <Route path="/results" element={<PageTransition><ProtectedRoute><Results /></ProtectedRoute></PageTransition>} />
        <Route path="/history" element={<PageTransition><ProtectedRoute><History /></ProtectedRoute></PageTransition>} />
        <Route path="/settings" element={<PageTransition><ProtectedRoute><Settings /></ProtectedRoute></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function GlobalFooter() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!isHomePage) return null;

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      className="bg-white border-t mt-auto relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between gap-8 text-sm text-[#6B7280]">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <img src="/Scanly.png" alt="Scanly Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-[#064e3b]">Scanly</span>
          </div>
          <p className="leading-relaxed">Empowering smarter buying decisions. Our advanced AI analysis decodes product labels, ensuring consumer truth and safety for everyone.</p>
        </div>

        <div className="flex gap-12 sm:gap-24">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#064e3b] uppercase tracking-wider text-xs">Resources</h4>
            <Link to="/" className="hover:text-[#16a34a] transition-colors font-medium">Home</Link>
            <Link to="/scan" className="hover:text-[#16a34a] transition-colors font-medium">Scan Product</Link>
            <Link to="/about" className="hover:text-[#16a34a] transition-colors font-medium">About Us</Link>
            <Link to="/settings" className="hover:text-[#16a34a] transition-colors font-medium">Settings</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#064e3b] uppercase tracking-wider text-xs">Legal</h4>
            <a href="[https://www.termsfeed.com/live/8d7f12ef-5462-45f6-a825-7887e2d923c3]" target="_blank" rel="noopener noreferrer" className="hover:text-[#16a34a] transition-colors font-medium">Privacy Policy</a>
            <a href="[https://www.termsfeed.com/live/afe2dceb-42ff-4b91-98fa-ea54fd1b0184]" target="_blank" rel="noopener noreferrer" className="hover:text-[#16a34a] transition-colors font-medium">Terms & Conditions</a>
            <Link to="/contact" className="hover:text-[#16a34a] transition-colors font-medium">Contact Us</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
         <p>© {new Date().getFullYear()} TruthScan AI. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}

export default function App() {
  const user = useAuthStore((state) => state.user);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  
  const language = useAppStore((state) => state.language);
  const hasSeenSplash = useAppStore((state) => state.hasSeenSplash);
  const setHasSeenSplash = useAppStore((state) => state.setHasSeenSplash);
  
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);
  const [showLang, setShowLang] = useState(!language && hasSeenSplash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  
  const { isInstallable, handleInstall } = usePWAInstall();

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    useScanStore.getState().removeOldHistory();
    return () => unsubscribe();
  }, [initAuthListener]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setHasSeenSplash(true);
    if (!language) setShowLang(true);
  };

  const handleLangComplete = () => {
    setShowLang(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
        {showLang && !showSplash && <LanguageSelector key="lang" onComplete={handleLangComplete} />}
        <AuthErrorToast key="auth-error" />
        
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white py-3 px-4 text-center font-medium shadow-lg"
          >
            ⚠️ You are offline. Please check your internet connection to continue scanning.
          </motion.div>
        )}
        
        {showOnlineToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white py-3 px-6 rounded-full font-medium shadow-lg"
          >
            ✅ Back online
          </motion.div>
        )}
      </AnimatePresence>

      <Router>
        <div className="min-h-screen bg-[#022c22] flex flex-col text-[#022c22] font-sans">
          <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 z-50">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                  <img src="/Scanly.png" alt="Scanly Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-xl text-[#064e3b]">Scanly</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/scan" className="text-sm font-semibold hover:text-[#16a34a] flex items-center gap-1.5 transition-colors">
                  <Camera size={18} /> Scan
                </Link>
                <Link to="/history" className="text-sm font-semibold hover:text-[#16a34a] flex items-center gap-1.5 transition-colors">
                  <HistoryIcon size={18} /> History
                </Link>
                <Link to="/about" className="text-sm font-semibold hover:text-[#16a34a] flex items-center gap-1.5 transition-colors">
                  <Info size={18} /> About
                </Link>
                <Link to="/contact" className="text-sm font-semibold hover:text-[#16a34a] flex items-center gap-1.5 transition-colors">
                  Contact
                </Link>
                {isInstallable && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-[#16a34a]/30 transition-all"
                  >
                    <Smartphone size={16} />
                    Install App
                  </motion.button>
                )}
                <Link to="/settings" className="text-gray-400 hover:text-[#16a34a] transition-colors">
                  <SettingsIcon size={20} />
                </Link>
                
                {/* Auth Actions */}
                <div className="pl-6 border-l border-gray-100 flex items-center gap-3">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || ''} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-[#16a34a]/20 shadow-sm object-cover" />
                      <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <LogOut size={18} />
                      </button>
                    </div>
                  ) : (
                    <Button onClick={loginWithGoogle} size="sm" variant="outline" className="flex gap-2 rounded-xl shadow-sm border-gray-200 hover:border-[#16a34a]/30 hover:bg-[#16a34a]/5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign In
                    </Button>
                  )}
                </div>
              </nav>

              {/* Mobile Burger Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          {/* Mobile Overlay Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-40 bg-white pt-20 px-6 pb-6 flex flex-col md:hidden"
              >
                <div className="flex flex-col gap-6 text-lg font-medium">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                     <Search size={20} className="text-[#16a34a]" /> Home
                  </Link>
                  <Link to="/scan" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    <Camera size={20} className="text-[#16a34a]" /> Scan Product
                  </Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    <HistoryIcon size={20} className="text-[#16a34a]" /> Scan History
                  </Link>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    <Info size={20} className="text-[#16a34a]" /> About Us
                  </Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    Contact
                  </Link>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    <SettingsIcon size={20} className="text-[#16a34a]" /> Settings
                  </Link>
                  
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    {user ? (
                      <div className="flex items-center justify-between p-3 bg-[#f0fdf4] rounded-2xl border border-[#16a34a]/20">
                        <div className="flex items-center gap-3">
                           <img src={user.photoURL || ''} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-[#064e3b]">{user.displayName}</span>
                             <span className="text-xs text-[#15803d] truncate w-32">{user.email}</span>
                           </div>
                        </div>
                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="p-2 bg-white rounded-full text-red-500 shadow-sm border border-red-100">
                          <LogOut size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button onClick={() => { loginWithGoogle(); setMobileMenuOpen(false); }} className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-6 rounded-2xl text-lg font-bold shadow-lg shadow-[#16a34a]/20 flex items-center justify-center gap-3">
                           Sign in with Google
                        </Button>
                        <p className="text-xs text-gray-500 font-medium text-center px-2">
                          We recommend <strong>Google Login</strong> for maximum account security, safety, and seamless synchronization.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1 flex flex-col pt-0 bg-[#022c22] relative overflow-hidden">
            <AnimatedRoutes />
          </main>
          
          <GlobalFooter />
        </div>
      </Router>
    </>
  );
}
