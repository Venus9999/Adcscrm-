import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, promptInstall, isAndroid, isIOS } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'features'>('android');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header with App Branding */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Smartphone className="w-36 h-36" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="h-14 px-3 py-2 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
                <img src="/logo-adcs.svg" alt="ADCS Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-[10px] font-bold tracking-wider uppercase border border-blue-400/30 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Progressive Web App
                </span>
                <h3 className="text-xl font-black tracking-tight text-white">
                  ADCS CRM Mobile App
                </h3>
                <p className="text-xs text-blue-100/90 font-medium">
                  Install on Android, iOS, or Desktop
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'android'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Android Install
            </span>
            {activeTab === 'android' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'ios'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5" />
              iPhone / iPad
            </span>
            {activeTab === 'ios' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'features'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              App Capabilities
            </span>
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'android' && (
            <div className="space-y-4">
              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="block font-bold text-xs">PWA Already Installed</strong>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      You are using ADCS CRM in standalone application mode.
                    </span>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                    <p className="text-xs text-blue-900 dark:text-blue-200 font-semibold mb-1">
                      Ready for Instant 1-Tap Installation
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Tap the button below to add ADCS CRM directly to your Android launcher and home screen.
                    </p>
                  </div>

                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install ADCS App on Android</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How to install on Android Chrome or Samsung Internet:
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block font-bold">Open Chrome Menu</strong>
                        Tap the <strong>three dots (⋮)</strong> in the top-right corner of Google Chrome.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block font-bold">Tap "Install app" or "Add to Home screen"</strong>
                        Select <strong>Install app</strong> from the dropdown menu.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block font-bold">Launch Fullscreen App</strong>
                        Tap the ADCS CRM icon on your Android home screen to launch with zero browser bars.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Share / Open on Mobile Phone helper */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Open on your Android phone:
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'URL Copied!' : 'Copy Mobile Link'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                How to install on iPhone & iPad (Safari):
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block font-bold">Open in Safari</strong>
                    Open this URL in the Apple Safari browser.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block font-bold">Tap Share Button</strong>
                    Tap the <strong>Share</strong> button at the bottom bar (square with arrow up).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block font-bold">Add to Home Screen</strong>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Fullscreen</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Runs without browser URL bars or navigation tabs like a native application.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Offline Resilience</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Caches app shell & documents so you never lose access while traveling.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                  <span>App Shortcuts</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Long-press app icon on Android home screen to jump straight to Leads or Invoices.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cloud Synchronization</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Auto-syncs changes smoothly with the cloud backend whenever connected.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
