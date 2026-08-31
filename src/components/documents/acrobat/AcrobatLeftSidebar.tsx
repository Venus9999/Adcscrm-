import React, { useState } from 'react';
import {
  Layers,
  MessageSquare,
  Bookmark,
  Paperclip,
  FileSpreadsheet,
  RotateCw,
  Trash2,
  Copy,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Search,
} from 'lucide-react';
import { AcrobatAnnotation, AcrobatPageMeta } from './types';

interface AcrobatLeftSidebarProps {
  pages: AcrobatPageMeta[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onRotatePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePageUp: (index: number) => void;
  onMovePageDown: (index: number) => void;
  onAddBlankPage: () => void;
  
  annotations: AcrobatAnnotation[];
  onSelectAnnotation: (id: string, pageIndex: number) => void;
  onDeleteAnnotation: (id: string) => void;
}

type SidebarTab = 'thumbnails' | 'comments' | 'fields' | 'bookmarks' | 'attachments';

export const AcrobatLeftSidebar: React.FC<AcrobatLeftSidebarProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onRotatePage,
  onDuplicatePage,
  onDeletePage,
  onMovePageUp,
  onMovePageDown,
  onAddBlankPage,
  annotations,
  onSelectAnnotation,
  onDeleteAnnotation,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('thumbnails');
  const [commentFilter, setCommentFilter] = useState('');

  const filteredAnnotations = annotations.filter((a) => {
    if (!commentFilter) return true;
    const query = commentFilter.toLowerCase();
    return (
      (a.content && a.content.toLowerCase().includes(query)) ||
      (a.noteAuthor && a.noteAuthor.toLowerCase().includes(query)) ||
      (a.stampTitle && a.stampTitle.toLowerCase().includes(query)) ||
      a.type.toLowerCase().includes(query)
    );
  });

  const formFieldAnnotations = annotations.filter((a) => a.type === 'form_field');

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full select-none">
      {/* Sidebar Icon Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-1">
        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            activeTab === 'thumbnails'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Page Thumbnails"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Pages ({pages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            activeTab === 'comments'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Comments & Annotations"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Notes ({annotations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            activeTab === 'fields'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Form Fields"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Forms</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Bookmarks & Structure"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Page Thumbnails */}
      {activeTab === 'thumbnails' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Bar */}
          <div className="p-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Page Manager
            </span>
            <button
              onClick={onAddBlankPage}
              className="px-2 py-0.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded text-[11px] font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Page</span>
            </button>
          </div>

          {/* Thumbnails Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pages.map((page, idx) => {
              const isCurrent = idx === currentPageIndex;
              const pageAnnotations = annotations.filter((a) => a.pageIndex === idx);

              return (
                <div
                  key={`page-thumb-${idx}`}
                  onClick={() => onSelectPage(idx)}
                  className={`group relative rounded-xl border p-2 cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  {/* Header & Page Number */}
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Page {idx + 1}
                    </span>

                    {/* Badge counts */}
                    <div className="flex items-center gap-1">
                      {pageAnnotations.length > 0 && (
                        <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          {pageAnnotations.length} item{pageAnnotations.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {page.rotation !== 0 && (
                        <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {page.rotation}°
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Preview Area */}
                  <div
                    className="w-full aspect-[1/1.414] bg-white rounded-lg overflow-hidden relative shadow-inner flex items-center justify-center border border-slate-700/50"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  >
                    {page.renderedImageDataUrl ? (
                      <img
                        src={page.renderedImageDataUrl}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex flex-col justify-between text-slate-800 text-[8px] bg-slate-50">
                        <div className="h-1.5 w-1/3 bg-slate-300 rounded-xs mb-1" />
                        <div className="space-y-1">
                          <div className="h-1 w-full bg-slate-200 rounded-xs" />
                          <div className="h-1 w-5/6 bg-slate-200 rounded-xs" />
                          <div className="h-1 w-4/6 bg-slate-200 rounded-xs" />
                        </div>
                        <div className="h-2 w-1/2 bg-blue-100 rounded-xs self-end" />
                      </div>
                    )}
                  </div>

                  {/* Quick Action Floating Controls on Hover */}
                  <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePageUp(idx);
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-800 hover:text-white rounded disabled:opacity-20"
                        title="Move Page Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePageDown(idx);
                        }}
                        disabled={idx === pages.length - 1}
                        className="p-1 hover:bg-slate-800 hover:text-white rounded disabled:opacity-20"
                        title="Move Page Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePage(idx);
                        }}
                        className="p-1 hover:bg-slate-800 hover:text-blue-400 rounded"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicatePage(idx);
                        }}
                        className="p-1 hover:bg-slate-800 hover:text-emerald-400 rounded"
                        title="Duplicate Page"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(idx);
                        }}
                        disabled={pages.length <= 1}
                        className="p-1 hover:bg-rose-900/40 hover:text-rose-400 rounded disabled:opacity-20"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Comments & Annotations */}
      {activeTab === 'comments' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2.5 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search comments..."
                value={commentFilter}
                onChange={(e) => setCommentFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredAnnotations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                <p>No comments or markups yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Use the Sticky Note or Highlighter tool in the ribbon.
                </p>
              </div>
            ) : (
              filteredAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onSelectAnnotation(ann.id, ann.pageIndex)}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-slate-800 rounded text-slate-400">
                        P.{ann.pageIndex + 1}
                      </span>
                      <span className="capitalize">{ann.type.replace('_', ' ')}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(ann.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {ann.content && (
                    <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/60 p-1.5 rounded-md border border-slate-800/60">
                      {ann.content}
                    </p>
                  )}

                  {ann.stampTitle && (
                    <div className="text-[11px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                      Seal: {ann.stampTitle}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {ann.noteAuthor || 'PRO Officer'}
                    </span>
                    <span>Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Form Fields Navigator */}
      {activeTab === 'fields' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-800 text-xs text-slate-400">
            Interactive Form Fields ({formFieldAnnotations.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {formFieldAnnotations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                <p>No form fields added.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Switch to "Prepare Form" mode to add interactive input fields.
                </p>
              </div>
            ) : (
              formFieldAnnotations.map((field) => (
                <div
                  key={field.id}
                  onClick={() => onSelectAnnotation(field.id, field.pageIndex)}
                  className="p-2 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">
                      {field.formFieldName || 'Untitled Field'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Page {field.pageIndex + 1} • {field.formFieldType}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Bookmarks & Structure */}
      {activeTab === 'bookmarks' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Document Sections
          </div>
          {[
            { title: '1. Cover Letter & Application Header', page: 0 },
            { title: '2. Applicant Identification & Passport Details', page: 0 },
            { title: '3. Sponsor & Company Guarantees', page: Math.min(1, pages.length - 1) },
            { title: '4. Government Declarations & e-Signatures', page: pages.length - 1 },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPage(item.page)}
              className="w-full p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-left flex items-center justify-between transition-colors"
            >
              <span className="text-slate-300 font-medium truncate">{item.title}</span>
              <span className="text-[10px] text-slate-500 ml-2 font-mono">P.{item.page + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
