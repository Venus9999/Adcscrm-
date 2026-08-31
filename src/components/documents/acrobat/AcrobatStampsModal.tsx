import React, { useState } from 'react';
import { X, Stamp, ShieldCheck, Check, Sparkles, Building2, Award } from 'lucide-react';
import { AcrobatAnnotation } from './types';

interface AcrobatStampsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStamp: (stampConfig: Partial<AcrobatAnnotation>) => void;
}

export const AcrobatStampsModal: React.FC<AcrobatStampsModalProps> = ({
  isOpen,
  onClose,
  onApplyStamp,
}) => {
  const [selectedType, setSelectedType] = useState<string>('gdrfa');
  const [customRef, setCustomRef] = useState(`UAE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [stampDate, setStampDate] = useState(new Date().toLocaleDateString('en-GB'));

  if (!isOpen) return null;

  const stampCatalog = [
    {
      id: 'gdrfa',
      title: 'GDRFA DUBAI ATTESTED',
      subtext: 'General Directorate of Residency and Foreigners Affairs',
      color: '#059669', // Emerald
      borderColor: '#059669',
      tag: 'Official Government',
    },
    {
      id: 'mofa',
      title: 'MOFAIC ATTESTATION',
      subtext: 'Ministry of Foreign Affairs & International Cooperation',
      color: '#2563eb', // Blue
      borderColor: '#2563eb',
      tag: 'Consular Legal',
    },
    {
      id: 'approved',
      title: 'PRO APPROVED & VERIFIED',
      subtext: 'Authorized Corporate PRO Service Centre',
      color: '#0284c7', // Sky
      borderColor: '#0284c7',
      tag: 'Operations',
    },
    {
      id: 'urgent',
      title: 'URGENT VIP EXPRESS',
      subtext: '24-Hour Fast Track Immigration Queue',
      color: '#dc2626', // Red
      borderColor: '#dc2626',
      tag: 'Priority Stamp',
    },
    {
      id: 'true_copy',
      title: 'CERTIFIED TRUE COPY',
      subtext: 'Verified Against Original Registry Record',
      color: '#7c3aed', // Purple
      borderColor: '#7c3aed',
      tag: 'Notary Seal',
    },
    {
      id: 'received',
      title: 'RECEIVED & RECORDED',
      subtext: 'Immigration Dossier Verification Unit',
      color: '#d97706', // Amber
      borderColor: '#d97706',
      tag: 'Intake Stamp',
    },
  ];

  const handleSelect = (stamp: typeof stampCatalog[0]) => {
    onApplyStamp({
      type: 'stamp',
      stampTitle: stamp.title,
      stampSubtext: `${stamp.subtext} • Ref: ${customRef} • Date: ${stampDate}`,
      stampDate,
      stampRefNo: customRef,
      textColor: stamp.color,
      borderColor: stamp.borderColor,
      width: 32,
      height: 12,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl">
              <Stamp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Government & PRO Official Seals</h3>
              <p className="text-[11px] text-slate-400">Select an attestation or authority stamp to embed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Parameters */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Official Reference Code</label>
            <input
              type="text"
              value={customRef}
              onChange={(e) => setCustomRef(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Attestation Date</label>
            <input
              type="text"
              value={stampDate}
              onChange={(e) => setStampDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="p-5 overflow-y-auto max-h-[380px] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stampCatalog.map((stamp) => (
            <div
              key={stamp.id}
              onClick={() => handleSelect(stamp)}
              className="group p-4 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {stamp.tag}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: stamp.color }}
                />
              </div>

              {/* Stamp Visual Render */}
              <div
                className="p-3 rounded-lg border-2 border-dashed text-center select-none bg-slate-900/60 transition-transform group-hover:rotate-[-1deg]"
                style={{ borderColor: stamp.color, color: stamp.color }}
              >
                <div className="font-black text-xs uppercase tracking-wider">{stamp.title}</div>
                <div className="text-[9px] opacity-80 mt-0.5 line-clamp-1">{stamp.subtext}</div>
                <div className="text-[8px] font-mono mt-1 pt-1 border-t border-current/20 flex items-center justify-between">
                  <span>REF: {customRef}</span>
                  <span>{stampDate}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end text-[11px] font-bold text-slate-400 group-hover:text-white">
                <span>Click to Apply →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
