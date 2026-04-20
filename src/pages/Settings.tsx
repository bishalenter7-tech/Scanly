import React, { useState, useEffect } from 'react';
import { useScanStore } from '../store/scanStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { ShieldCheck, Check, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const avatars = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", // Boy 1
  "https://api.dicebear.com/7.x/adventurer/svg?seed=George", // Boy 2
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver", // Boy 3
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella", // Girl 1
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy", // Girl 2
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna", // Girl 3
];

export default function Settings() {
  const { language, setLanguage } = useScanStore();
  const { user, loginWithGoogle, logout, updateProfileData } = useAuthStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if ((window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(function(OneSignal: any) {
        setNotificationsEnabled(OneSignal.Notifications.permission === 'granted');
      });
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      setToastMessage('Notifications are already enabled! To disable them, please use your browser or device site settings.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } else {
      if ((window as any).OneSignalDeferred) {
        (window as any).OneSignalDeferred.push(function(OneSignal: any) {
          OneSignal.Slidedown.promptPush();
        });
        setTimeout(() => {
          (window as any).OneSignalDeferred.push(function(OneSignal: any) {
            setNotificationsEnabled(OneSignal.Notifications.permission === 'granted');
          });
        }, 2000);
      }
    }
  };

  // Native Browser Notification Toggle
  const [nativeNotifStatus, setNativeNotifStatus] = useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNativeNotifStatus(Notification.permission);
    }
  }, []);

  const handleNativeNotificationToggle = async () => {
    if (!("Notification" in window)) {
      setToastMessage("This browser does not support desktop notifications.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNativeNotifStatus(permission);
      if (permission === "granted") {
        setToastMessage("Native Notifications Enabled Successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } else {
      setToastMessage("Notifications are already enabled! To disable them, you must change it in your device/browser settings.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (updateProfileData) {
        await updateProfileData(displayName, photoURL);
        setSaveMessage('Profile saved successfully!');
      }
    } catch (err) {
      setSaveMessage('Error saving profile.');
    }
    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12">
      <h1 className="text-3xl font-bold text-[#064e3b] mb-8">Settings</h1>
      
      <div className="space-y-8" key={user?.uid || 'no-user'}>
        
        {/* Account and Security Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 border-b pb-4">Account Profile</h2>
          
          <div className="space-y-6 pt-2">
            {!user ? (
              <div className="bg-[#f0fdf4] p-5 rounded-2xl border border-[#16a34a]/20 flex flex-col items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-[#16a34a]">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#064e3b] text-lg">Secure Login Recommended</h3>
                  </div>
                </div>
                <p className="text-sm text-[#15803d] leading-relaxed max-w-2xl">
                  We exclusively use <strong>Google Authentication</strong> to ensure the highest level of security and privacy for your account. It is widely recognized as one of the safest and best identity providers in the universe. By keeping login strictly via Google, we ensure that your credentials remain perfectly protected and aligned with our strict data safety guidelines.
                </p>
                <Button onClick={loginWithGoogle} className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl shadow-lg shadow-[#16a34a]/20 mt-2 px-6">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Profile Edit Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#16a34a] focus:border-[#16a34a] block p-3 outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose an Avatar</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {avatars.map((url, index) => (
                      <div 
                        key={index}
                        onClick={() => setPhotoURL(url)}
                        className={`relative cursor-pointer rounded-full p-1 transition-all ${photoURL === url ? 'bg-[#16a34a] shadow-lg scale-110' : 'hover:bg-gray-100 hover:scale-105'}`}
                      >
                        <img 
                          src={url} 
                          alt={`Avatar ${index + 1}`} 
                          className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                        />
                        {photoURL === url && (
                          <div className="absolute top-0 right-0 bg-[#16a34a] border-2 border-white text-white rounded-full p-0.5 shadow-sm">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Option to keep original Google Avatar if not in the list */}
                  {!avatars.includes(photoURL) && photoURL !== '' && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative rounded-full p-1 bg-[#16a34a] shadow-lg">
                        <img src={photoURL} alt="Current Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                        <div className="absolute top-0 right-0 bg-[#16a34a] border-2 border-white text-white rounded-full p-0.5">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Current Google Avatar</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleProfileSave} 
                      disabled={isSaving}
                      className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl shadow-lg shadow-[#16a34a]/20 px-8"
                    >
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                    {saveMessage && (
                      <span className="text-sm font-bold text-[#16a34a] animate-fade-in">{saveMessage}</span>
                    )}
                  </div>
                  <Button onClick={logout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    Log Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 border-b pb-4">Data Persistence</h2>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">Scan History Storage</p>
                <p className="text-sm text-gray-500 max-w-md mt-1">
                  History is securely stored in your local browser storage and automatically purged after 7 days. If logged in, items are securely backed up to your account.
                </p>
              </div>
              <div className="bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-lg text-sm font-semibold border border-[#16a34a]/20 text-center w-fit">
                Active
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 border-b pb-4">App Preferences</h2>
          <div className="space-y-6 pt-2">
            {/* Language Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">Translation Language</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Choose the language you prefer for label analysis and AI recommendations.
                </p>
              </div>
              <div>
                <select 
                  value={language || 'en'} 
                  onChange={handleLanguageChange}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#16a34a] focus:border-[#16a34a] block w-full p-2.5 outline-none font-medium appearance-none min-w-[140px]"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="bn">🇧🇩 Bengali</option>
                  <option value="ja">🇯🇵 Japanese</option>
                  <option value="zh">🇨🇳 Chinese</option>
                </select>
              </div>
            </div>

            {/* Dietary Profile (Coming Soon) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-60 pointer-events-none pt-4 border-t border-gray-50">
              <div>
                <p className="font-medium text-gray-900">Dietary Profile</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Highlight allergens and ingredients based on your diet (e.g. Vegan, Keto, Nut Allergy).
                </p>
              </div>
              <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200 text-center w-fit">
                Coming Soon
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 border-b pb-4">Notifications</h2>
          
          {/* OneSignal Push Notifications */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notificationsEnabled ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'bg-gray-100 text-gray-400'}`}>
                {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <p className="font-bold text-gray-900">Push Notifications (Web)</p>
                <p className="text-sm text-gray-500">
                  Receive alerts for free scan refills and health tips
                </p>
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                notificationsEnabled ? 'bg-[#16a34a]' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: notificationsEnabled ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Native Browser Notifications */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${nativeNotifStatus === 'granted' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'bg-gray-100 text-gray-400'}`}>
                {nativeNotifStatus === 'granted' ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <p className="font-bold text-gray-900">Native Notifications</p>
                <p className="text-sm text-gray-500">
                  Browser-level notifications (Status: {nativeNotifStatus})
                </p>
              </div>
            </div>
            <button 
              onClick={handleNativeNotificationToggle}
              disabled={nativeNotifStatus === 'granted'}
              className={`px-4 py-2 rounded-xl font-medium text-white transition-all ${
                nativeNotifStatus === 'granted' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#16a34a] hover:bg-[#15803d]'
              }`}
            >
              {nativeNotifStatus === 'granted' ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </section>

      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <Bell size={18} />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
