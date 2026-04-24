import React, { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, Info } from 'lucide-react';
import { Button } from './ui/button';

export default function InAppBrowserPrompt() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor;
    // Detect Instagram and Facebook in-app browsers
    const isInstagram = (ua.indexOf('Instagram') > -1);
    const isFacebook = (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1);
    
    if (isInstagram || isFacebook) {
      setIsInApp(true);
    }
  }, []);

  const handleOpenBrowser = () => {
    const url = window.location.href;
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android intent to forcefully open in Chrome
      const urlWithoutProtocol = url.replace(/^https?:\/\//i, '');
      const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end;`;
      window.location.href = intentUrl;
    } else if (isIOS) {
       // iOS restricts automatic redirection, alert user with manual steps
       alert("On iPhone/iPad, Apple restricts automatic redirection. Please tap the 3 dots (...) at the top right of your screen and select 'Open in System Browser' or 'Open in Safari'.");
    } else {
      window.open(url, '_blank');
    }
  };

  if (!isInApp) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#022c22] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-yellow-500/30">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Login is restricted here</h2>
        <p className="text-green-100/90 mb-8 max-w-sm leading-relaxed">
          Instagram and Facebook block Google sign-in for security reasons. You need to open Scanly in your normal web browser to sign in and use the app.
        </p>
        
        <Button 
          onClick={handleOpenBrowser}
          className="w-full max-w-xs bg-yellow-500 hover:bg-yellow-400 text-yellow-950 py-7 rounded-2xl text-[17px] font-bold shadow-lg flex items-center justify-center gap-3"
        >
           <ExternalLink size={20} />
           Tap here to open Browser
        </Button>
        
        <div className="mt-8 bg-[#064e3b] p-5 rounded-2xl border border-[#16a34a]/30 max-w-sm text-left">
           <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
             <Info size={16} className="text-[#22c55e]" />
             If the button doesn't work:
           </h3>
           <p className="text-sm text-green-100/80">
             1. Tap the <strong>3 dots (...)</strong> in the top corner of your screen.<br/>
             2. Select <strong>"Open in System Browser"</strong> or <strong>"Open in Chrome/Safari"</strong>.<br/>
           </p>
        </div>
    </div>
  );
}