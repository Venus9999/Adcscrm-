import React, { useState } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenModal }) => {
  const { isInstallable, isInstalled, promptInstall, isAndroid } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('adcs_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('adcs_pwa_banner_dismissed', 'true');
    } catch {}
  };

  const handleAction = async () => {
    if (isInstallable) {
      const success = await promptInstall();
      if (!success) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-blue-500/30 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-white truncate">
                Install ADCS CRM App
              </p>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/30 text-blue-300 rounded border border-blue-400/20 uppercase">
                {isAndroid ? 'Android' : 'PWA'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Add to Home Screen for fast mobile access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleAction}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
