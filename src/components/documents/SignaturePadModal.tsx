import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, Type, Upload, Sparkles } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
  initialSignerName?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  initialSignerName = '',
}) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(initialSignerName);
  const [fontStyle, setFontStyle] = useState<'font-signature-1' | 'font-signature-2' | 'font-signature-3'>('font-signature-1');
  const [penColor, setPenColor] = useState<'#1e3a8a' | '#0f172a' | '#047857' | '#b91c1c'>('#1e3a8a');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (tab === 'draw') {
      const timer = setTimeout(() => {
        initCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const currentCoords = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentCoords.x, currentCoords.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPointRef.current = currentCoords;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    initCanvas();
  };

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
      onClose();
    } else if (tab === 'type') {
      if (!typedName.trim()) return;
      // Render text to canvas and generate signature image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 200;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 600, 200);
      ctx.fillStyle = penColor;
      
      let fontName = 'cursive, "Brush Script MT", "Segoe Script", sans-serif';
      if (fontStyle === 'font-signature-1') {
        fontName = '"Caveat", "Dancing Script", cursive, "Brush Script MT", sans-serif';
      } else if (fontStyle === 'font-signature-2') {
        fontName = '"Great Vibes", "Alex Brush", cursive, "Segoe Script", sans-serif';
      } else {
        fontName = '"Sacramento", "Cedarville Cursive", cursive, serif';
      }

      ctx.font = `italic 54px ${fontName}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 300, 100);

      // Add a subtle underline flourish
      ctx.beginPath();
      ctx.moveTo(100, 140);
      ctx.bezierCurveTo(250, 130, 400, 155, 520, 135);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      onSaveSignature(tempCanvas.toDataURL('image/png'));
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSaveSignature(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Digital Signature</h3>
              <p className="text-[11px] text-slate-500">Legally compliant electronic signature for UAE PRO & visa forms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'draw'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('type')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'type'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Name</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Draw Tab */}
        {tab === 'draw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Ink Color:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#1e3a8a', label: 'Navy' },
                    { color: '#0f172a', label: 'Black' },
                    { color: '#047857', label: 'Emerald' },
                    { color: '#b91c1c', label: 'Red' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setPenColor(c.color as any)}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        penColor === c.color ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Stroke:</span>
                <select
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="text-xs p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <option value={2}>Fine (2px)</option>
                  <option value={3}>Medium (3px)</option>
                  <option value={5}>Bold (5px)</option>
                </select>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-medium text-xs">
                  Sign within this box using your mouse, trackpad, or touch screen
                </div>
              )}
              <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 font-mono pointer-events-none">
                ✖ Sign along the line ___________________________
              </div>
            </div>
          </div>
        )}

        {/* Type Tab */}
        {tab === 'type' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Signer's Full Legal Name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. Tariq Mansoor Al-Nuaimi"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Choose Signature Style:</span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'font-signature-1', label: 'Modern Cursive', previewStyle: 'italic font-serif' },
                  { id: 'font-signature-2', label: 'Executive Script', previewStyle: 'italic font-mono' },
                  { id: 'font-signature-3', label: 'Formal Calligraphy', previewStyle: 'italic font-sans' },
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setFontStyle(s.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      fontStyle === s.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">{s.label}</span>
                      <span className={`text-xl text-blue-900 dark:text-blue-300 ${s.previewStyle}`}>
                        {typedName || 'Sample Signature'}
                      </span>
                    </div>
                    {fontStyle === s.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div className="space-y-4">
            <label className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors">
              <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileUpload} className="hidden" />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Click to Upload Signature File</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG with transparent background, JPG, SVG</p>
            </label>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Encrypted e-Sign standard</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={tab === 'draw' && !hasDrawn}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
