import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ScanSearch, ShieldCheck, FileCheck, Languages, Sparkles, BrainCircuit, FlaskConical, BadgeCheck, BarChart3, Smartphone, Download, X } from 'lucide-react';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Landing() {
  const { isInstallable, installApp } = usePWAInstall();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* PWA Install Banner */}
      <AnimatePresence>
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[90] bg-gradient-to-r from-[#064e3b] to-[#16a34a] shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">📱 Install Scanly App</p>
                  <p className="text-white/80 text-xs">Add to your home screen for faster access</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={installApp}
                  className="flex items-center gap-2 bg-white text-[#064e3b] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Install Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 space-y-6 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-[#064e3b] tracking-tight leading-tight">
            Scan. Analyze. <br className="hidden md:block"/> Know the Truth.
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto md:mx-0">
            Scanly is your smart companion to decode ingredients, verify claims, and get instant safety scores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/scan" className={buttonVariants({ size: "lg", className: "bg-[#16a34a] hover:bg-[#15803d] text-white px-8 h-12 text-lg shadow-lg shadow-[#16a34a]/20" })}>
                Start Scanning <Camera className="ml-2 h-5 w-5"/>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-8 text-lg" })}>
                See How It Works
              </a>
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 relative w-full max-w-md mx-auto"
        >
          {/* Animated 2D Character (Bot) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            className="absolute -top-16 -right-8 z-20 hidden md:block"
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Bot Body */}
              <rect x="25" y="40" width="70" height="60" rx="16" fill="#16a34a" />
              {/* Bot Head */}
              <path d="M40 40V30C40 24.4772 44.4772 20 50 20H70C75.5228 20 80 24.4772 80 30V40H40Z" fill="#15803d" />
              {/* Antenna */}
              <line x1="60" y1="20" x2="60" y2="10" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
              <circle cx="60" cy="8" r="4" fill="#FCD34D" />
              {/* Eyes */}
              <circle cx="45" cy="55" r="5" fill="white" />
              <circle cx="75" cy="55" r="5" fill="white" />
              {/* Mouth/Screen */}
              <rect x="35" y="70" width="50" height="16" rx="8" fill="#042f2e" />
              <motion.line 
                x1="45" y1="78" x2="75" y2="78" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" 
                animate={{ x2: [45, 75, 45] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              {/* Arms */}
              <path d="M25 60C15 60 10 70 10 80" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M95 60C105 60 110 70 110 80" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>

          <motion.div 
            whileHover={{ rotate: 1, scale: 1.02 }}
            className="aspect-[4/5] bg-white rounded-3xl shadow-[0_20px_50px_rgba(22,163,74,0.15)] border border-[#16a34a]/10 overflow-hidden p-6 flex flex-col gap-4 transition-transform duration-500 cursor-pointer relative z-10"
          >
             <div className="bg-[#f0fdf4] rounded-xl h-48 border-2 border-dashed border-[#16a34a]/50 flex items-center justify-center">
                <Camera size={48} className="text-[#16a34a]/50" />
             </div>
             <div className="space-y-3 mt-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center gap-4 py-4">
                   <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center font-bold text-xl text-green-600 bg-green-50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">85</div>
                   <div className="flex-1 space-y-2">
                     <div className="h-3 w-full bg-gray-100 rounded" />
                     <div className="h-3 w-4/5 bg-gray-100 rounded" />
                   </div>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f0fdf4]/50 skew-y-3 transform -z-10" />
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            className="text-3xl font-bold text-center mb-12 text-[#064e3b]"
          >
            Everything you need to know
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-50px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: <ScanSearch className="text-[#16a34a]" size={24} />, title: "Smart Image Scan", desc: "Take a photo of any product, anywhere in the world. Our AI identifies it instantly." },
              { icon: <Sparkles className="text-[#16a34a]" size={24} />, title: "Ingredient Analysis", desc: "Every ingredient decoded in plain language with clear health impacts." },
              { icon: <ShieldCheck className="text-[#16a34a]" size={24} />, title: "Safety Score", desc: "Instant 0–100 safety rating, color-coded for quick purchasing decisions." },
              { icon: <FileCheck className="text-[#16a34a]" size={24} />, title: "Truth Detection", desc: "AI verifies every marketing claim: True, Misleading, or False." },
              { icon: <Languages className="text-[#16a34a]" size={24} />, title: "Multi-Language", desc: "Japanese, Chinese, Hindi, Arabic — decode any label, any language." },
              { icon: <BarChart3 className="text-[#16a34a]" size={24} />, title: "Visual Output", desc: "Animated cards and easy-to-read gauges, not boring text walls." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="h-full"
              >
                <FeatureCard icon={f.icon} title={f.title} description={f.desc} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-32 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#064e3b]">How It Works</h2>
        <p className="text-gray-500 mb-16 max-w-2xl mx-auto">From snap to truth in just a few seconds.</p>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative max-w-5xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[40%] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-[#16a34a]/10 via-[#16a34a] to-[#16a34a]/10 -z-10 -translate-y-1/2 rounded" />
          
          {/* Mobile Connecting Line */}
          <div className="md:hidden absolute top-[10%] bottom-[10%] left-1/2 w-[3px] bg-gradient-to-b from-[#16a34a]/10 via-[#16a34a] to-[#16a34a]/10 -z-10 -translate-x-1/2 rounded" />

          {[
            { step: '1', title: 'Take Photo', icon: <Camera size={32} /> },
            { step: '2', title: 'AI Detects', icon: <BrainCircuit size={32} /> },
            { step: '3', title: 'Analyze', icon: <FlaskConical size={32} /> },
            { step: '4', title: 'Verify', icon: <BadgeCheck size={32} /> },
            { step: '5', title: 'Results', icon: <BarChart3 size={32} /> }
          ].map((item, idx) => (
            <motion.div 
              key={item.step} 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ delay: idx * 0.15, type: 'spring' }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#16a34a]/10 flex flex-col items-center gap-4 w-44 z-10 cursor-default"
            >
              <div className="relative">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#16a34a] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {item.step}
                </div>
                <div className="p-4 bg-[#f0fdf4] text-[#16a34a] rounded-xl shadow-inner group-hover:bg-[#16a34a] group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
              </div>
              <div className="text-gray-800 text-sm font-bold tracking-wide">{item.title}</div>
            </motion.div>
          ))}
        </div>
      </section>

    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-[#16a34a]/10 shadow-sm h-full bg-white/50 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="h-12 w-12 bg-[#f0fdf4] rounded-xl flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-[#064e3b]">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
