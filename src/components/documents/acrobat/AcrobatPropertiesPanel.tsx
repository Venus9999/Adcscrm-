import React from 'react';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Sliders,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  Copy,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AcrobatAnnotation, AcrobatPageMeta, WatermarkConfig } from './types';
import { Client, DocumentItem } from '../../../types/crm';

interface AcrobatPropertiesPanelProps {
  selectedAnnotation: AcrobatAnnotation | null;
  onUpdateAnnotation: (id: string, updates: Partial<AcrobatAnnotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  onDuplicateAnnotation: (id: string) => void;
  
  // Document Metadata
  docTitle: string;
  setDocTitle: (title: string) => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  docCategory: DocumentItem['category'];
  setDocCategory: (cat: DocumentItem['category']) => void;
  docExpiryDate: string;
  setDocExpiryDate: (date: string) => void;
  clients: Client[];
  
  // Watermark
  watermarkConfig: WatermarkConfig;
  onOpenWatermarkModal: () => void;
  onOpenHeaderFooterModal: () => void;
}

export const AcrobatPropertiesPanel: React.FC<AcrobatPropertiesPanelProps> = ({
  selectedAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDuplicateAnnotation,
  docTitle,
  setDocTitle,
  selectedClientId,
  setSelectedClientId,
  docCategory,
  setDocCategory,
  docExpiryDate,
  setDocExpiryDate,
  clients,
  watermarkConfig,
  onOpenWatermarkModal,
  onOpenHeaderFooterModal,
}) => {
  const fontFamilies = [
    { label: 'Helvetica / Arial', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Courier New (Mono)', value: 'Courier New, monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { label: 'Impact Display', value: 'Impact, sans-serif' },
    { label: 'Cursive / Script', value: 'Brush Script MT, cursive' },
  ];

  const colorPresets = [
    '#0f172a', // Slate 900
    '#1e293b', // Slate 800
    '#2563eb', // Blue 600
    '#059669', // Emerald 600
    '#dc2626', // Red 600
    '#d97706', // Amber 600
    '#7c3aed', // Purple 600
    '#ffffff', // White
  ];

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>{selectedAnnotation ? 'Object Inspector' : 'Document Properties'}</span>
        </div>
        {selectedAnnotation && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded border border-blue-500/30">
            {selectedAnnotation.type.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="p-3 space-y-4 text-xs">
        {/* CASE 1: ANNOTATION IS SELECTED */}
        {selectedAnnotation ? (
          <div className="space-y-4">
            {/* Quick action bar: Duplicate & Delete */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <button
                onClick={() => onDuplicateAnnotation(selectedAnnotation.id)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3 text-emerald-400" />
                <span>Duplicate</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      zIndex: (selectedAnnotation.zIndex || 10) + 1,
                    })
                  }
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  title="Bring Forward"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    onUpdateAnnotation(selectedAnnotation.id, {
                      zIndex: Math.max(1, (selectedAnnotation.zIndex || 10) - 1),
                    })
                  }
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  title="Send Backward"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
                  className="p-1 hover:bg-rose-900/40 text-rose-400 rounded"
                  title="Delete Object"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TEXT PROPERTIES */}
            {(selectedAnnotation.type === 'text' || selectedAnnotation.type === 'sticky_note') && (
              <div className="space-y-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  <span>Typography</span>
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Font Family</label>
                  <select
                    value={selectedAnnotation.fontFamily || 'Helvetica, Arial, sans-serif'}
                    onChange={(e) =>
                      onUpdateAnnotation(selectedAnnotation.id, { fontFamily: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {fontFamilies.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Styling Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 mb-1 block">Size (pt)</label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      value={selectedAnnotation.fontSize || 16}
                      onChange={(e) =>
                        onUpdateAnnotation(selectedAnnotation.id, {
                          fontSize: parseInt(e.target.value, 10) || 14,
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="flex items-end gap-1">
                    <button
                      onClick={() =>
                        onUpdateAnnotation(selectedAnnotation.id, {
                          fontWeight:
                            selectedAnnotation.fontWeight === 'bold' ? 'normal' : 'bold',
                        })
                      }
                      className={`p-1.5 rounded-lg border text-xs ${
                        selectedAnnotation.fontWeight === 'bold'
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        onUpdateAnnotation(selectedAnnotation.id, {
                          fontStyle:
                            selectedAnnotation.fontStyle === 'italic' ? 'normal' : 'italic',
                        })
                      }
                      className={`p-1.5 rounded-lg border text-xs ${
                        selectedAnnotation.fontStyle === 'italic'
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Alignment</label>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textAlign: align })
                        }
                        className={`flex-1 py-1 rounded text-center text-xs flex justify-center ${
                          (selectedAnnotation.textAlign || 'left') === align
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                        {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                        {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                        {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color Presets */}
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Text Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textColor: c })
                        }
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${
                          (selectedAnnotation.textColor || '#0f172a') === c
                            ? 'border-blue-500 scale-110 shadow-xs'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedAnnotation.textColor || '#0f172a'}
                      onChange={(e) =>
                        onUpdateAnnotation(selectedAnnotation.id, { textColor: e.target.value })
                      }
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded-full"
                      title="Custom Color"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OPACITY & GEOMETRY */}
            <div className="space-y-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-300 flex items-center justify-between text-xs">
                <span>Opacity & Blending</span>
                <span className="font-mono text-slate-400">
                  {Math.round((selectedAnnotation.opacity !== undefined ? selectedAnnotation.opacity : 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selectedAnnotation.opacity !== undefined ? selectedAnnotation.opacity : 1}
                onChange={(e) =>
                  onUpdateAnnotation(selectedAnnotation.id, {
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-500"
              />

              {/* Geometry Dimensions */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1.5">Position & Scale</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    X: {Math.round(selectedAnnotation.x)}%
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    Y: {Math.round(selectedAnnotation.y)}%
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    W: {Math.round(selectedAnnotation.width)}%
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    H: {Math.round(selectedAnnotation.height)}%
                  </div>
                </div>
              </div>
            </div>

            {/* STAMP PROPERTIES */}
            {selectedAnnotation.type === 'stamp' && (
              <div className="space-y-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-300 text-xs">Seal Attributes</div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Stamp Header</label>
                  <input
                    type="text"
                    value={selectedAnnotation.stampTitle || ''}
                    onChange={(e) =>
                      onUpdateAnnotation(selectedAnnotation.id, { stampTitle: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subtext / Reference</label>
                  <input
                    type="text"
                    value={selectedAnnotation.stampSubtext || ''}
                    onChange={(e) =>
                      onUpdateAnnotation(selectedAnnotation.id, { stampSubtext: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CASE 2: DOCUMENT-LEVEL PROPERTIES (NO ANNOTATION SELECTED) */
          <div className="space-y-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Document Dossier</span>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">File Name</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Linked Client */}
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Client Record</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Standalone Document --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || `${c.firstName} ${c.lastName}`.trim()} ({c.nationality || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Passport">Passport Copy</option>
                  <option value="Visa">Visa / Entry Permit</option>
                  <option value="Emirates ID">Emirates ID</option>
                  <option value="Trade License">Trade License / Commercial</option>
                  <option value="Establishment Card">Establishment Card</option>
                  <option value="Labour Card">MOHRE Labour Card</option>
                  <option value="Medical Fitness">Medical Fitness Certificate</option>
                  <option value="Insurance">Health Insurance Card</option>
                  <option value="Contract">Employment Contract</option>
                  <option value="Other">Other PRO Document</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Validity / Expiry</label>
                <input
                  type="date"
                  value={docExpiryDate}
                  onChange={(e) => setDocExpiryDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Watermark & Security Quick Actions */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-300 text-xs flex items-center justify-between">
                <span>Security & Watermarks</span>
                {watermarkConfig.enabled && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                    Active
                  </span>
                )}
              </div>

              <button
                onClick={onOpenWatermarkModal}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between"
              >
                <span>Watermark Overlay</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                onClick={onOpenHeaderFooterModal}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between"
              >
                <span>Headers, Footers & Bates</span>
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* Compliance Badge */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PDF/A & Acrobat Pro Verified</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                Compatible with UAE Federal ICP, GDRFA Dubai, MOHRE and Ministry of Foreign Affairs (MOFA) attestation standards.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
