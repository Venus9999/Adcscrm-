import React, { useState } from 'react';
import { X, ShieldCheck, Check, Sliders, Type, Hash, Calendar, FileText } from 'lucide-react';
import { HeaderFooterConfig, WatermarkConfig } from './types';

interface AcrobatWatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'watermark' | 'header_footer';
  watermarkConfig: WatermarkConfig;
  setWatermarkConfig: React.Dispatch<React.SetStateAction<WatermarkConfig>>;
  headerFooterConfig: HeaderFooterConfig;
  setHeaderFooterConfig: React.Dispatch<React.SetStateAction<HeaderFooterConfig>>;
}

export const AcrobatWatermarkModal: React.FC<AcrobatWatermarkModalProps> = ({
  isOpen,
  onClose,
  mode,
  watermarkConfig,
  setWatermarkConfig,
  headerFooterConfig,
  setHeaderFooterConfig,
}) => {
  if (!isOpen) return null;

  const watermarkPresets = [
    'CONFIDENTIAL',
    'DRAFT - NOT FINAL',
    'ORIGINAL COPY',
    'GDRFA SUBMISSION',
    'MOFA ATTESTATION',
    'PRO APPROVED',
    'INTERNAL USE ONLY',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'watermark' ? (
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            ) : (
              <Sliders className="w-5 h-5 text-indigo-400" />
            )}
            <h3 className="font-bold text-sm text-slate-100">
              {mode === 'watermark' ? 'Add / Configure Watermark' : 'Headers, Footers & Page Numbering'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {mode === 'watermark' ? (
            /* WATERMARK CONFIG */
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Enable Watermark</div>
                  <div className="text-[11px] text-slate-400">Display text overlay across document pages</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermarkConfig.enabled}
                    onChange={(e) =>
                      setWatermarkConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Text Input & Quick Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkConfig.text}
                  onChange={(e) =>
                    setWatermarkConfig((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold uppercase tracking-wider focus:border-blue-500"
                  placeholder="e.g. CONFIDENTIAL"
                />

                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {watermarkPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        setWatermarkConfig((prev) => ({ ...prev, text: preset, enabled: true }))
                      }
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[10px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Opacity, Size, Rotation */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between mb-1 text-[11px] text-slate-400">
                    <span>Opacity</span>
                    <span className="font-mono">{Math.round(watermarkConfig.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.8}
                    step={0.05}
                    value={watermarkConfig.opacity}
                    onChange={(e) =>
                      setWatermarkConfig((prev) => ({
                        ...prev,
                        opacity: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-[11px] text-slate-400">
                    <span>Font Size</span>
                    <span className="font-mono">{watermarkConfig.fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={90}
                    step={4}
                    value={watermarkConfig.fontSize}
                    onChange={(e) =>
                      setWatermarkConfig((prev) => ({
                        ...prev,
                        fontSize: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="h-28 bg-white rounded-xl border border-slate-700 relative overflow-hidden flex items-center justify-center shadow-inner">
                <div
                  className="font-black text-center select-none uppercase tracking-widest pointer-events-none"
                  style={{
                    color: watermarkConfig.color || '#dc2626',
                    opacity: watermarkConfig.enabled ? watermarkConfig.opacity : 0.05,
                    transform: `rotate(${watermarkConfig.rotation || -45}deg)`,
                    fontSize: `${Math.max(16, watermarkConfig.fontSize / 2.5)}px`,
                  }}
                >
                  {watermarkConfig.text || 'WATERMARK PREVIEW'}
                </div>
              </div>
            </div>
          ) : (
            /* HEADERS & FOOTERS CONFIG */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Enable Headers & Footers</div>
                  <div className="text-[11px] text-slate-400">
                    Add standard corporate margins and page numbering
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerFooterConfig.enabled}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Header Blocks */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Header Row</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Header Left (e.g. Ref No)"
                    value={headerFooterConfig.headerLeft}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, headerLeft: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Header Center (e.g. PRO Dossier)"
                    value={headerFooterConfig.headerCenter}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, headerCenter: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Header Right (e.g. Confidential)"
                    value={headerFooterConfig.headerRight}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, headerRight: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                </div>
              </div>

              {/* Footer Blocks */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-300 text-xs">Footer Row</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Footer Left (e.g. Date)"
                    value={headerFooterConfig.footerLeft}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, footerLeft: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Footer Center (e.g. Page X of Y)"
                    value={headerFooterConfig.footerCenter}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, footerCenter: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Footer Right (e.g. UAE ICP)"
                    value={headerFooterConfig.footerRight}
                    onChange={(e) =>
                      setHeaderFooterConfig((prev) => ({ ...prev, footerRight: e.target.value }))
                    }
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
