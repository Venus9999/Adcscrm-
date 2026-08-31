import React from 'react';
import {
  Type,
  Image as ImageIcon,
  PenTool,
  ShieldCheck,
  FileCheck,
  CheckSquare,
  Square,
  Circle,
  ArrowRight,
  Highlighter,
  Underline,
  Strikethrough,
  MessageSquare,
  Layers,
  Sparkles,
  Scissors,
  Grid,
  FileSignature,
  FileSpreadsheet,
  Lock,
  Eye,
  Sliders,
  RotateCw,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Hand,
  Maximize2,
  Calendar,
  Stamp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  FolderPlus,
  Bookmark,
  QrCode,
  Download,
  Save,
  Printer,
  ChevronDown,
  Globe,
  Bot,
  FileText,
  MousePointer,
  HelpCircle,
  X,
  ChevronLeft,
  ArrowLeft,
} from 'lucide-react';
import { AcrobatMode, AcrobatTool } from './types';

interface AcrobatRibbonProps {
  activeMode: AcrobatMode;
  setActiveMode: (mode: AcrobatMode) => void;
  activeTool: AcrobatTool;
  setActiveTool: (tool: AcrobatTool) => void;
  
  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // Zoom & Views
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  fitToWidth: () => void;
  fitToPage: () => void;

  // Quick Action Triggers
  onOpenSignatureModal: () => void;
  onOpenStampPicker: () => void;
  onOpenWatermarkModal: () => void;
  onOpenHeaderFooterModal: () => void;
  onOpenAIAssistant: () => void;
  onInsertImageClick: () => void;
  onAddBlankPage: () => void;
  onRotateCurrentPage: () => void;
  onAutoFillClientData: () => void;
  onApplyRedactions: () => void;

  // Save / Export
  onSaveToVault: () => void;
  onDownloadPdf: () => void;
  onPrintPdf: () => void;
  isSaving: boolean;

  // Exit / Close
  onClose?: () => void;

  // Page Info
  currentPage: number;
  totalPages: number;
}

export const AcrobatRibbon: React.FC<AcrobatRibbonProps> = ({
  activeMode,
  setActiveMode,
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  setZoomLevel,
  fitToWidth,
  fitToPage,
  onOpenSignatureModal,
  onOpenStampPicker,
  onOpenWatermarkModal,
  onOpenHeaderFooterModal,
  onOpenAIAssistant,
  onInsertImageClick,
  onAddBlankPage,
  onRotateCurrentPage,
  onAutoFillClientData,
  onApplyRedactions,
  onSaveToVault,
  onDownloadPdf,
  onPrintPdf,
  isSaving,
  onClose,
  currentPage,
  totalPages,
}) => {
  const modes: { id: AcrobatMode; label: string; icon: any; badge?: string }[] = [
    { id: 'edit', label: 'Edit PDF', icon: Type },
    { id: 'comment', label: 'Comment & Markup', icon: MessageSquare },
    { id: 'organize', label: 'Organize Pages', icon: Grid, badge: `${totalPages} pgs` },
    { id: 'fill_sign', label: 'Fill & Sign', icon: FileSignature },
    { id: 'forms', label: 'Prepare Form', icon: FileSpreadsheet },
    { id: 'protect', label: 'Protect & Redact', icon: Lock },
    { id: 'ai', label: 'Acrobat AI', icon: Sparkles, badge: 'PRO' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 flex flex-col shrink-0">
      {/* Top Application Bar with Mode Tabs and Exit button */}
      <div className="h-11 bg-slate-950 px-3 flex items-center justify-between border-b border-slate-800/80 gap-2">
        {/* Left: Exit to Dashboard + Acrobat Mode Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {onClose && (
            <button
              onClick={onClose}
              className="mr-1 px-2.5 py-1 bg-slate-800/90 hover:bg-rose-600/90 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 hover:border-rose-500 shadow-xs shrink-0"
              title="Exit PDF Editor and return to Dashboard (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit to Dashboard</span>
              <span className="sm:hidden">Exit</span>
            </button>
          )}

          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id);
                  // Set sensible default tool for this mode
                  if (m.id === 'edit') setActiveTool('select');
                  if (m.id === 'comment') setActiveTool('sticky_note');
                  if (m.id === 'fill_sign') setActiveTool('select');
                  if (m.id === 'forms') setActiveTool('form_text');
                  if (m.id === 'protect') setActiveTool('redact_mark');
                  if (m.id === 'ai') onOpenAIAssistant();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{m.label}</span>
                {m.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-md font-mono ${
                      isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* AI Quick Button */}
          <button
            onClick={onOpenAIAssistant}
            className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shadow-purple-500/20"
            title="Ask Acrobat AI Assistant about this document"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Download */}
          <button
            onClick={onDownloadPdf}
            disabled={isSaving}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1"
            title="Export / Download Flattened PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Print */}
          <button
            onClick={onPrintPdf}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Print PDF Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Save to Vault */}
          <button
            onClick={onSaveToVault}
            disabled={isSaving}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            title="Save into CRM Document Vault"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Vault</span>
          </button>

          {/* Close/Exit X Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-rose-500 transition-colors ml-1"
              title="Close PDF Editor & Exit to Dashboard (Esc)"
              aria-label="Close PDF Editor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Secondary Contextual Tool Ribbon */}
      <div className="h-11 bg-slate-900 px-3 flex items-center justify-between border-b border-slate-800/60 overflow-x-auto scrollbar-none">
        {/* Left Side: Specific Tools for Current Mode */}
        <div className="flex items-center gap-1">
          {/* Universal Selection & Pan Tools */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 mr-2">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                activeTool === 'select'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Select & Move Tool (V)"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('hand_pan')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                activeTool === 'hand_pan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Hand Pan Canvas Tool (H)"
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. EDIT PDF TOOLS */}
          {activeMode === 'edit' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('text')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add New Text Box"
              >
                <Type className="w-3.5 h-3.5 text-blue-400" />
                <span>Add Text</span>
              </button>

              <button
                onClick={onInsertImageClick}
                className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                title="Insert Image (Passport Photo, Emirates ID Scan, Logo)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Image</span>
              </button>

              <button
                onClick={onOpenWatermarkModal}
                className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                title="Add Watermark (Confidential, Draft, Copy)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Watermark</span>
              </button>

              <button
                onClick={onOpenHeaderFooterModal}
                className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                title="Add Header & Footer / Page Numbers"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Header & Footer</span>
              </button>

              <button
                onClick={onOpenStampPicker}
                className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                title="Official Government & PRO Stamps"
              >
                <Stamp className="w-3.5 h-3.5 text-rose-400" />
                <span>Stamps</span>
              </button>
            </div>
          )}

          {/* 2. COMMENT & MARKUP TOOLS */}
          {activeMode === 'comment' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('sticky_note')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'sticky_note'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add Sticky Note Comment"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>Sticky Note</span>
              </button>

              <button
                onClick={() => setActiveTool('highlighter')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'highlighter'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Fluorescent Highlighter"
              >
                <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
                <span>Highlight</span>
              </button>

              <button
                onClick={() => setActiveTool('underline')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'underline'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Underline Text"
              >
                <Underline className="w-3.5 h-3.5 text-blue-400" />
                <span>Underline</span>
              </button>

              <button
                onClick={() => setActiveTool('strikethrough')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'strikethrough'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Strikethrough Markup"
              >
                <Strikethrough className="w-3.5 h-3.5 text-rose-400" />
                <span>Strikethrough</span>
              </button>

              <button
                onClick={() => setActiveTool('pencil')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'pencil'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Freehand Pencil Tool"
              >
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>Draw</span>
              </button>

              <button
                onClick={() => setActiveTool('shape_rect')}
                className={`p-1.5 rounded-lg text-xs ${
                  activeTool === 'shape_rect' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Rectangle Box"
              >
                <Square className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('shape_circle')}
                className={`p-1.5 rounded-lg text-xs ${
                  activeTool === 'shape_circle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Oval / Circle"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('shape_arrow')}
                className={`p-1.5 rounded-lg text-xs ${
                  activeTool === 'shape_arrow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Arrow Pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. ORGANIZE PAGES TOOLS */}
          {activeMode === 'organize' && (
            <div className="flex items-center gap-1">
              <button
                onClick={onAddBlankPage}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
                title="Insert Blank A4 Page"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert Page</span>
              </button>

              <button
                onClick={onRotateCurrentPage}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
                title="Rotate Page 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate</span>
              </button>
            </div>
          )}

          {/* 4. FILL & SIGN TOOLS */}
          {activeMode === 'fill_sign' && (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenSignatureModal}
                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5"
                title="Draw or Insert Digital e-Signature"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Sign Document</span>
              </button>

              <button
                onClick={() => setActiveTool('form_date')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'form_date' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Insert Date Stamp"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Date Field</span>
              </button>

              <button
                onClick={() => setActiveTool('form_checkbox')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'form_checkbox' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Insert Checkmark (✓)"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Checkmark</span>
              </button>

              <button
                onClick={onAutoFillClientData}
                className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                title="Auto-populate Client Full Name, Passport, and Visa details from CRM"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Fill from Client</span>
              </button>
            </div>
          )}

          {/* 5. PREPARE FORM TOOLS */}
          {activeMode === 'forms' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('form_text')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  activeTool === 'form_text' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add Text Input Field"
              >
                <Type className="w-3.5 h-3.5 text-blue-400" />
                <span>Text Box</span>
              </button>

              <button
                onClick={() => setActiveTool('form_checkbox')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  activeTool === 'form_checkbox' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add Checkbox"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Checkbox</span>
              </button>

              <button
                onClick={() => setActiveTool('form_dropdown')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  activeTool === 'form_dropdown' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add Dropdown Select List"
              >
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dropdown</span>
              </button>

              <button
                onClick={() => setActiveTool('form_signature')}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  activeTool === 'form_signature' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add Signature Target Field"
              >
                <FileSignature className="w-3.5 h-3.5 text-rose-400" />
                <span>Signature Block</span>
              </button>
            </div>
          )}

          {/* 6. PROTECT & REDACT TOOLS */}
          {activeMode === 'protect' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('redact_mark')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'redact_mark' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Mark Area for Permanent Redaction"
              >
                <Scissors className="w-3.5 h-3.5 text-rose-300" />
                <span>Mark for Redaction</span>
              </button>

              <button
                onClick={onApplyRedactions}
                className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1"
                title="Permanently Blackout and Sanitize marked fields"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Apply Redactions</span>
              </button>

              <button
                onClick={() => setActiveTool('cert_stamp')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  activeTool === 'cert_stamp' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Embed Cryptographic Digital Certificate Seal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certify Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Undo/Redo & Zoom & View Controls */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo buttons */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 px-1 py-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(40, prev - 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <span className="text-[11px] font-mono text-slate-300 px-1.5 min-w-[42px] text-center">
              {zoomLevel}%
            </span>

            <button
              onClick={() => setZoomLevel((prev) => Math.min(300, prev + 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <button
              onClick={fitToWidth}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Fit Width
            </button>
            <button
              onClick={fitToPage}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Fit Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
