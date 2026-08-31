import React from 'react';
import {
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Download,
  Check,
  X,
  Layers,
  Sparkles,
  Grid,
} from 'lucide-react';
import { AcrobatPageMeta } from './types';

interface AcrobatOrganizePagesViewProps {
  pages: AcrobatPageMeta[];
  onRotatePage: (index: number) => void;
  onRotateAllPages: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePageUp: (index: number) => void;
  onMovePageDown: (index: number) => void;
  onAddBlankPage: () => void;
  onCloseOrganizeView: () => void;
  onSelectAndEditPage: (index: number) => void;
}

export const AcrobatOrganizePagesView: React.FC<AcrobatOrganizePagesViewProps> = ({
  pages,
  onRotatePage,
  onRotateAllPages,
  onDuplicatePage,
  onDeletePage,
  onMovePageUp,
  onMovePageDown,
  onAddBlankPage,
  onCloseOrganizeView,
  onSelectAndEditPage,
}) => {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
      {/* Top Organize Action Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Grid className="w-4 h-4 text-blue-400" />
            <span>Organize Pages</span>
            <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded-full font-mono">
              {pages.length} Page{pages.length > 1 ? 's' : ''} Total
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Quick Operations */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onAddBlankPage}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Blank Page</span>
            </button>

            <button
              onClick={onRotateAllPages}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Rotate All 90°</span>
            </button>
          </div>
        </div>

        <button
          onClick={onCloseOrganizeView}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Done Organizing</span>
        </button>
      </div>

      {/* Pages Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pages.map((page, idx) => (
            <div
              key={`org-page-${idx}`}
              className="group bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/80 p-3.5 transition-all shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between mb-2.5 text-xs">
                <span className="font-bold px-2 py-0.5 bg-slate-800 text-slate-200 rounded-md font-mono text-xs">
                  Page {idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMovePageUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded disabled:opacity-20"
                    title="Move Left / Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMovePageDown(idx)}
                    disabled={idx === pages.length - 1}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded disabled:opacity-20"
                    title="Move Right / Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Page Visual Canvas Thumbnail */}
              <div
                onClick={() => onSelectAndEditPage(idx)}
                className="w-full aspect-[1/1.414] bg-white rounded-xl overflow-hidden shadow-inner cursor-pointer relative border border-slate-700 flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              >
                {page.renderedImageDataUrl ? (
                  <img
                    src={page.renderedImageDataUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between text-slate-800 text-xs bg-slate-50">
                    <div className="h-2 w-1/3 bg-slate-300 rounded mb-2" />
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-200 rounded" />
                      <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                      <div className="h-1.5 w-4/6 bg-slate-200 rounded" />
                      <div className="h-1.5 w-3/6 bg-slate-200 rounded" />
                    </div>
                    <div className="h-3 w-1/2 bg-blue-100 rounded self-end" />
                  </div>
                )}

                {/* Click to Edit Overlay Badge on Hover */}
                <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md">
                    Open & Edit
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRotatePage(idx)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-blue-400 rounded-lg text-xs flex items-center gap-1"
                    title="Rotate Page 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Rotate</span>
                  </button>

                  <button
                    onClick={() => onDuplicatePage(idx)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 rounded-lg text-xs flex items-center gap-1"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Duplicate</span>
                  </button>
                </div>

                <button
                  onClick={() => onDeletePage(idx)}
                  disabled={pages.length <= 1}
                  className="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg disabled:opacity-20 transition-colors"
                  title="Delete Page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
