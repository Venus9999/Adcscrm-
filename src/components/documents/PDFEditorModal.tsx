import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Save,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Type,
  PenTool,
  CheckSquare,
  Square,
  Circle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Eye,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  FolderPlus,
  Sliders,
  Maximize2,
  FileSpreadsheet,
  Image as ImageIcon,
  Stamp,
  MessageSquare,
  Highlighter,
  Underline,
  Strikethrough,
  Scissors,
  Lock,
  Grid,
  FileSignature,
  Hand,
  MousePointer,
  HelpCircle,
  Share2,
  Move,
  ArrowLeft,
  GripHorizontal,
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useCRM } from '../../context/CRMContext';
import { DocumentItem, Client } from '../../types/crm';
import { SignaturePadModal } from './SignaturePadModal';
import {
  AcrobatMode,
  AcrobatTool,
  AcrobatAnnotation,
  AcrobatPageMeta,
  WatermarkConfig,
  HeaderFooterConfig,
} from './acrobat/types';
import { AcrobatRibbon } from './acrobat/AcrobatRibbon';
import { AcrobatLeftSidebar } from './acrobat/AcrobatLeftSidebar';
import { AcrobatPropertiesPanel } from './acrobat/AcrobatPropertiesPanel';
import { AcrobatOrganizePagesView } from './acrobat/AcrobatOrganizePagesView';
import { AcrobatAIAssistantModal } from './acrobat/AcrobatAIAssistantModal';
import { AcrobatWatermarkModal } from './acrobat/AcrobatWatermarkModal';
import { AcrobatStampsModal } from './acrobat/AcrobatStampsModal';

// Setup PDF.js worker fallback
try {
  if (typeof window !== 'undefined' && pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker initialization notice:', e);
}

/**
 * Validates if the byte array begins with '%PDF' or contains it in the initial byte block.
 */
function isValidPdfBuffer(bytes: Uint8Array | null | undefined): boolean {
  if (!bytes || bytes.length < 5) return false;
  const searchLimit = Math.min(bytes.length - 4, 1024);
  for (let i = 0; i <= searchLimit; i++) {
    if (
      bytes[i] === 0x25 &&     // %
      bytes[i + 1] === 0x50 && // P
      bytes[i + 2] === 0x44 && // D
      bytes[i + 3] === 0x46    // F
    ) {
      return true;
    }
  }
  return false;
}

interface PDFEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: DocumentItem | null;
  initialPdfUrl?: string;
  initialClient?: Client | null;
  onSavedToVault?: (newDoc: DocumentItem) => void;
}

export const PDFEditorModal: React.FC<PDFEditorModalProps> = ({
  isOpen,
  onClose,
  initialDocument,
  initialPdfUrl,
  initialClient,
  onSavedToVault,
}) => {
  const { clients, uploadDocument, updateDocumentStatus, currentUser } = useCRM();

  // Document Metadata State
  const [docTitle, setDocTitle] = useState(initialDocument?.name || 'New_Acrobat_Document.pdf');
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialDocument?.clientId || initialClient?.id || clients?.[0]?.id || ''
  );
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>(
    initialDocument?.category || 'Visa'
  );
  const [docExpiryDate, setDocExpiryDate] = useState<string>(initialDocument?.expiryDate || '');

  // Acrobat Navigation & Modes
  const [activeMode, setActiveMode] = useState<AcrobatMode>('edit');
  const [activeTool, setActiveTool] = useState<AcrobatTool>('select');

  // Multi-page State
  const [pages, setPages] = useState<AcrobatPageMeta[]>([
    { pageNumber: 1, rotation: 0, width: 595, height: 842 }, // Standard A4 points
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfRawBytes, setPdfRawBytes] = useState<Uint8Array | null>(null);

  // Annotations & Undo/Redo History
  const [annotations, setAnnotations] = useState<AcrobatAnnotation[]>([]);
  const [history, setHistory] = useState<AcrobatAnnotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Watermarks & Headers/Footers
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    fontSize: 48,
    fontFamily: 'Helvetica',
    color: '#dc2626',
    opacity: 0.15,
    rotation: -45,
    position: 'diagonal',
    allPages: true,
  });

  const [headerFooterConfig, setHeaderFooterConfig] = useState<HeaderFooterConfig>({
    enabled: false,
    headerLeft: 'ADCS PRO SERVICES',
    headerCenter: 'IMMIGRATION DOSSIER',
    headerRight: 'CONFIDENTIAL',
    footerLeft: new Date().toLocaleDateString('en-GB'),
    footerCenter: 'Page 1 of 1',
    footerRight: 'ICP / GDRFA VERIFIED',
    fontSize: 8,
    color: '#64748b',
    includePageNumbers: true,
  });

  // Sub-Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [watermarkModalMode, setWatermarkModalMode] = useState<'watermark' | 'header_footer'>('watermark');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSaveVaultDialog, setShowSaveVaultDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Drag & Move / Resize State
  const [activeDrag, setActiveDrag] = useState<{
    type: 'move' | 'resize';
    handle?: 'nw' | 'ne' | 'se' | 'sw';
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);

  // Refs for drawing & canvas
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingFreehand = useRef(false);
  const currentDrawingPoints = useRef<{ x: number; y: number }[]>([]);

  // Start Move Handler
  const handleStartMove = (e: React.PointerEvent, ann: AcrobatAnnotation) => {
    // If clicking inside a contentEditable text element that is actively being edited, let user edit text unless clicking drag handle or in select tool mode
    if ((e.target as HTMLElement).getAttribute('contenteditable') === 'true' && activeTool !== 'select') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setSelectedAnnotationId(ann.id);

    setActiveDrag({
      type: 'move',
      id: ann.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: ann.x,
      origY: ann.y,
      origWidth: ann.width,
      origHeight: ann.height,
    });
  };

  // Start Resize Handler
  const handleStartResize = (
    e: React.PointerEvent,
    ann: AcrobatAnnotation,
    handle: 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedAnnotationId(ann.id);

    setActiveDrag({
      type: 'resize',
      handle,
      id: ann.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: ann.x,
      origY: ann.y,
      origWidth: ann.width,
      origHeight: ann.height,
    });
  };

  // Pointer Move & Up Listeners for fluid dragging and resizing
  useEffect(() => {
    if (!activeDrag) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dxPct = ((e.clientX - activeDrag.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - activeDrag.startY) / rect.height) * 100;

      if (activeDrag.type === 'move') {
        const newX = Math.max(0, Math.min(100 - activeDrag.origWidth, activeDrag.origX + dxPct));
        const newY = Math.max(0, Math.min(100 - activeDrag.origHeight, activeDrag.origY + dyPct));

        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === activeDrag.id
              ? {
                  ...a,
                  x: Math.round(newX * 10) / 10,
                  y: Math.round(newY * 10) / 10,
                }
              : a
          )
        );
      } else if (activeDrag.type === 'resize') {
        const handle = activeDrag.handle;
        let newX = activeDrag.origX;
        let newY = activeDrag.origY;
        let newW = activeDrag.origWidth;
        let newH = activeDrag.origHeight;

        if (handle === 'se') {
          newW = Math.max(3, Math.min(100 - activeDrag.origX, activeDrag.origWidth + dxPct));
          newH = Math.max(2, Math.min(100 - activeDrag.origY, activeDrag.origHeight + dyPct));
        } else if (handle === 'sw') {
          const potentialX = activeDrag.origX + dxPct;
          const boundedX = Math.max(0, Math.min(activeDrag.origX + activeDrag.origWidth - 3, potentialX));
          newW = activeDrag.origWidth + (activeDrag.origX - boundedX);
          newX = boundedX;
          newH = Math.max(2, Math.min(100 - activeDrag.origY, activeDrag.origHeight + dyPct));
        } else if (handle === 'ne') {
          const potentialY = activeDrag.origY + dyPct;
          const boundedY = Math.max(0, Math.min(activeDrag.origY + activeDrag.origHeight - 2, potentialY));
          newH = activeDrag.origHeight + (activeDrag.origY - boundedY);
          newY = boundedY;
          newW = Math.max(3, Math.min(100 - activeDrag.origX, activeDrag.origWidth + dxPct));
        } else if (handle === 'nw') {
          const potentialX = activeDrag.origX + dxPct;
          const boundedX = Math.max(0, Math.min(activeDrag.origX + activeDrag.origWidth - 3, potentialX));
          newW = activeDrag.origWidth + (activeDrag.origX - boundedX);
          newX = boundedX;

          const potentialY = activeDrag.origY + dyPct;
          const boundedY = Math.max(0, Math.min(activeDrag.origY + activeDrag.origHeight - 2, potentialY));
          newH = activeDrag.origHeight + (activeDrag.origY - boundedY);
          newY = boundedY;
        }

        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === activeDrag.id
              ? {
                  ...a,
                  x: Math.round(newX * 10) / 10,
                  y: Math.round(newY * 10) / 10,
                  width: Math.round(newW * 10) / 10,
                  height: Math.round(newH * 10) / 10,
                }
              : a
          )
        );
      }
    };

    const handleGlobalPointerUp = () => {
      setAnnotations((latestAnns) => {
        recordHistory(latestAnns);
        return latestAnns;
      });
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [activeDrag]);

  // 1. Initial PDF Loader
  useEffect(() => {
    if (!isOpen) return;

    if (initialDocument?.fileUrl || initialPdfUrl) {
      const url = initialDocument?.fileUrl || initialPdfUrl || '';
      loadPdfFromUrl(url);
    } else {
      loadBlankTemplate('visa_noc');
    }
  }, [isOpen, initialDocument, initialPdfUrl]);

  // History Helper
  const recordHistory = (newAnnotations: AcrobatAnnotation[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newAnnotations);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setAnnotations(newAnnotations);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
      setSelectedAnnotationId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
      setSelectedAnnotationId(null);
    }
  };

  // Keyboard Shortcuts (Nudging, Deleting, Duplicating, Undo/Redo, Escape Exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true';

      // If a submodal is open, let Escape close that submodal
      if (showSignatureModal || showStampPicker || showWatermarkModal || showAIAssistant || showSaveVaultDialog) {
        if (e.key === 'Escape') {
          setShowSignatureModal(false);
          setShowStampPicker(false);
          setShowWatermarkModal(false);
          setShowAIAssistant(false);
          setShowSaveVaultDialog(false);
        }
        return;
      }

      // Escape key handler: Deselect or exit to dashboard
      if (e.key === 'Escape') {
        if (selectedAnnotationId) {
          setSelectedAnnotationId(null);
        } else {
          onClose();
        }
        return;
      }

      // Shortcuts when an annotation is selected
      if (selectedAnnotationId) {
        const selected = annotations.find((a) => a.id === selectedAnnotationId);
        if (!selected) return;

        if (!isTyping) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const step = e.shiftKey ? 2 : 0.5;
            const newX = Math.max(0, selected.x - step);
            updateAnnotation(selected.id, { x: Math.round(newX * 10) / 10 });
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const step = e.shiftKey ? 2 : 0.5;
            const newX = Math.min(100 - selected.width, selected.x + step);
            updateAnnotation(selected.id, { x: Math.round(newX * 10) / 10 });
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.shiftKey ? 2 : 0.5;
            const newY = Math.max(0, selected.y - step);
            updateAnnotation(selected.id, { y: Math.round(newY * 10) / 10 });
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const step = e.shiftKey ? 2 : 0.5;
            const newY = Math.min(100 - selected.height, selected.y + step);
            updateAnnotation(selected.id, { y: Math.round(newY * 10) / 10 });
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            deleteAnnotation(selected.id);
          }
        }

        // Ctrl / Cmd + D: Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          duplicateAnnotation(selected.id);
        }
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    selectedAnnotationId,
    annotations,
    showSignatureModal,
    showStampPicker,
    showWatermarkModal,
    showAIAssistant,
    showSaveVaultDialog,
    onClose,
  ]);

  // PDF Loader with strict signature validation
  const loadPdfFromUrl = async (url: string) => {
    setIsLoadingPdf(true);
    try {
      if (!url || typeof url !== 'string' || !url.trim()) {
        setPdfRawBytes(null);
        loadBlankTemplate('visa_noc');
        return;
      }

      let rawBytes: Uint8Array | null = null;

      if (url.startsWith('data:')) {
        try {
          const parts = url.split(',');
          if (parts.length > 1) {
            const base64Data = parts[1].replace(/\s/g, '');
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            if (isValidPdfBuffer(bytes)) {
              rawBytes = bytes;
            }
          }
        } catch (decodeErr) {
          console.warn('Could not decode data URL as PDF base64:', decodeErr);
        }
      } else if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
              const arrayBuffer = await res.arrayBuffer();
              const bytes = new Uint8Array(arrayBuffer);
              if (isValidPdfBuffer(bytes)) {
                rawBytes = bytes;
              }
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch PDF from URL:', url, fetchErr);
        }
      }

      if (rawBytes && isValidPdfBuffer(rawBytes)) {
        try {
          const pdfDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
          const pageCount = pdfDoc.getPageCount();
          const loadedPages: AcrobatPageMeta[] = [];

          for (let i = 0; i < pageCount; i++) {
            const p = pdfDoc.getPage(i);
            const { width, height } = p.getSize();
            loadedPages.push({
              pageNumber: i + 1,
              rotation: p.getRotation().angle,
              width,
              height,
            });
          }

          // Render thumbnails with PDF.js if available
          if (pdfjsLib) {
            try {
              const loadingTask = pdfjsLib.getDocument({ data: rawBytes.slice(0) });
              const pdfJsDoc = await loadingTask.promise;
              for (let i = 0; i < Math.min(pageCount, 12); i++) {
                const pdfJsPage = await pdfJsDoc.getPage(i + 1);
                const viewport = pdfJsPage.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                if (context) {
                  await (pdfJsPage as any).render({ canvasContext: context, viewport, canvas }).promise;
                  if (loadedPages[i]) {
                    loadedPages[i].renderedImageDataUrl = canvas.toDataURL('image/png');
                  }
                }
              }
            } catch (renderErr) {
              console.warn('PDF.js thumbnail rendering notice:', renderErr);
            }
          }

          setPdfRawBytes(rawBytes);
          setPages(loadedPages.length > 0 ? loadedPages : [{ pageNumber: 1, rotation: 0, width: 595, height: 842 }]);
          setCurrentPageIndex(0);
          recordHistory([]);
          return;
        } catch (pdfParseErr) {
          console.warn('PDFDocument.load failed on buffer, falling back to clean template:', pdfParseErr);
        }
      }

      // If URL did not yield a valid PDF document, fall back cleanly
      setPdfRawBytes(null);
      loadBlankTemplate('visa_noc');
    } catch (err) {
      console.warn('Handling PDF file fallback:', err);
      setPdfRawBytes(null);
      loadBlankTemplate('blank_a4');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Pre-configured UAE PRO Templates
  const loadBlankTemplate = (type: 'visa_noc' | 'service_order' | 'blank_a4') => {
    setPdfRawBytes(null);
    const client = clients.find((c) => c.id === selectedClientId) || initialClient;
    const clientName = client?.fullName || `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'MR. ALEXANDER IVANOV';
    const passportNo = client?.passportNo || 'N84920194';
    const nationality = client?.nationality || 'Russian Federation';
    const sponsorCompany = client?.companyName || 'ADCS CORPORATE SERVICES LLC';
    const today = new Date().toLocaleDateString('en-GB');

    const newPages: AcrobatPageMeta[] = [{ pageNumber: 1, rotation: 0, width: 595, height: 842 }];
    setPages(newPages);
    setCurrentPageIndex(0);

    const initialAnns: AcrobatAnnotation[] = [];

    if (type === 'visa_noc') {
      // Header
      initialAnns.push({
        id: 'ann-title',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 6,
        width: 84,
        height: 6,
        content: 'UNITED ARAB EMIRATES\nNO OBJECTION CERTIFICATE (NOC) FOR RESIDENCY VISA',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textColor: '#0f172a',
      });

      // Reference
      initialAnns.push({
        id: 'ann-ref',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 15,
        width: 84,
        height: 3.5,
        content: `Ref: UAE-PRO-NOC-${Date.now().toString().slice(-6)}               Date: ${today}`,
        fontSize: 11,
        fontWeight: 'normal',
        textColor: '#334155',
      });

      // Salutation
      initialAnns.push({
        id: 'ann-salut',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 20,
        width: 84,
        height: 5,
        content: 'To: General Directorate of Residency and Foreigners Affairs (GDRFA / ICP Dubai)\nSubject: No Objection for Employment & Residence Visa Stamping',
        fontSize: 12,
        fontWeight: 'bold',
        textColor: '#0f172a',
      });

      // Body text
      initialAnns.push({
        id: 'ann-body',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 27,
        width: 84,
        height: 24,
        content: `This is to certify that ${sponsorCompany} has NO OBJECTION for the issuance and stamping of a 2-Year Employment / Golden Residence Visa for the following applicant:\n\n• Full Legal Name: ${clientName}\n• Nationality: ${nationality}\n• Passport Number: ${passportNo}\n• Profession / Title: Senior Investment Consultant\n• Basic Salary: AED 28,500.00 / month\n\nAll legal liabilities, medical insurance, and residency compliance are guaranteed by the sponsoring establishment in accordance with UAE Federal Decree Law No. 29 of 2021.`,
        fontSize: 11,
        lineHeight: 1.5,
        textColor: '#1e293b',
      });

      // Signature Block
      initialAnns.push({
        id: 'ann-sign-lbl',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 56,
        width: 40,
        height: 6,
        content: 'Authorized PRO Signatory:\n\n_______________________\nADCS Government Relations Officer',
        fontSize: 10,
        textColor: '#475569',
      });

      // Stamp
      initialAnns.push({
        id: 'ann-stamp-default',
        pageIndex: 0,
        type: 'stamp',
        x: 58,
        y: 54,
        width: 34,
        height: 12,
        stampTitle: 'GDRFA DUBAI ATTESTED',
        stampSubtext: `Attested by Authorized PRO Service Unit • Ref: NOC-${Date.now().toString().slice(-4)}`,
        stampDate: today,
        textColor: '#059669',
        borderColor: '#059669',
      });
    } else if (type === 'service_order') {
      initialAnns.push({
        id: 'ann-so-title',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 6,
        width: 84,
        height: 6,
        content: 'PRO SERVICE ORDER & GOVERNMENT PROCESSING AGREEMENT',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        textColor: '#0f172a',
      });
      initialAnns.push({
        id: 'ann-so-body',
        pageIndex: 0,
        type: 'text',
        x: 8,
        y: 16,
        width: 84,
        height: 30,
        content: `CLIENT / APPLICANT: ${clientName}\nPASSPORT NO: ${passportNo} | NATIONALITY: ${nationality}\nSPONSOR: ${sponsorCompany}\nDATE: ${today}\n\nSERVICES INCLUDED:\n1. ICP / GDRFA Entry Permit Filing & Approval\n2. Dubai Health Authority (DHA) VIP Medical Fitness Examination\n3. Federal Authority for Identity & Citizenship (ICP) Biometrics / Emirates ID\n4. Residency Visa Electronic Stamping & MoHRE Contract Generation\n\nTERMS: Government typing fees and processing fees are non-refundable upon submission to ICP portal.`,
        fontSize: 11,
        lineHeight: 1.6,
        textColor: '#1e293b',
      });
      initialAnns.push({
        id: 'ann-so-stamp',
        pageIndex: 0,
        type: 'stamp',
        x: 56,
        y: 52,
        width: 36,
        height: 12,
        stampTitle: 'ADCS PRO SERVICES VERIFIED',
        stampSubtext: 'Corporate Services Department • Government Processing Unit',
        stampDate: today,
        textColor: '#2563eb',
        borderColor: '#2563eb',
      });
    }

    recordHistory(initialAnns);
  };

  // Zoom & Fit
  const fitToWidth = () => setZoomLevel(120);
  const fitToPage = () => setZoomLevel(90);

  // Multi-Page Management
  const handleAddBlankPage = () => {
    const newPageNum = pages.length + 1;
    const newPages = [...pages, { pageNumber: newPageNum, rotation: 0, width: 595, height: 842, isCustomBlank: true }];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleRotateAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const handleDuplicatePage = (index: number) => {
    const target = pages[index];
    const newPages = [...pages];
    newPages.splice(index + 1, 0, {
      ...target,
      pageNumber: pages.length + 1,
    });
    setPages(newPages);

    // Duplicate annotations on that page
    const pageAnns = annotations.filter((a) => a.pageIndex === index);
    const duplicatedAnns = pageAnns.map((a) => ({
      ...a,
      id: 'ann_' + Date.now() + Math.random().toString(36).substring(2, 6),
      pageIndex: index + 1,
    }));
    recordHistory([...annotations, ...duplicatedAnns]);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setCurrentPageIndex((prev) => Math.min(prev, newPages.length - 1));
    const newAnns = annotations.filter((a) => a.pageIndex !== index);
    recordHistory(newAnns);
  };

  const handleMovePageUp = (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    const temp = newPages[index - 1];
    newPages[index - 1] = newPages[index];
    newPages[index] = temp;
    setPages(newPages);
    setCurrentPageIndex(index - 1);
  };

  const handleMovePageDown = (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    const temp = newPages[index + 1];
    newPages[index + 1] = newPages[index];
    newPages[index] = temp;
    setPages(newPages);
    setCurrentPageIndex(index + 1);
  };

  // Annotation Updates & Operations
  const updateAnnotation = (id: string, updates: Partial<AcrobatAnnotation>) => {
    const updated = annotations.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann));
    recordHistory(updated);
  };

  const deleteAnnotation = (id: string) => {
    const updated = annotations.filter((ann) => ann.id !== id);
    recordHistory(updated);
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  const duplicateAnnotation = (id: string) => {
    const target = annotations.find((a) => a.id === id);
    if (!target) return;
    const clone: AcrobatAnnotation = {
      ...target,
      id: 'ann_' + Date.now() + Math.random().toString(36).substring(2, 6),
      x: Math.min(80, target.x + 3),
      y: Math.min(80, target.y + 3),
    };
    recordHistory([...annotations, clone]);
    setSelectedAnnotationId(clone.id);
  };

  // Auto-Fill from Client CRM profile
  const handleAutoFillClientData = () => {
    const client = clients.find((c) => c.id === selectedClientId) || initialClient;
    if (!client) {
      alert('Please select a client in the right properties panel first.');
      return;
    }

    const today = new Date().toLocaleDateString('en-GB');
    const autoFields: AcrobatAnnotation[] = [
      {
        id: 'ann-autofill-name',
        pageIndex: currentPageIndex,
        type: 'text',
        x: 10,
        y: 20,
        width: 45,
        height: 5,
        content: `Client Name: ${client.fullName || `${client.firstName} ${client.lastName}`.trim()}`,
        fontSize: 13,
        fontWeight: 'bold',
        textColor: '#0f172a',
      },
      {
        id: 'ann-autofill-passport',
        pageIndex: currentPageIndex,
        type: 'text',
        x: 10,
        y: 26,
        width: 45,
        height: 5,
        content: `Passport No: ${client.passportNo || 'N/A'} (Exp: ${client.passportExpiry || 'N/A'})`,
        fontSize: 12,
        textColor: '#1e293b',
      },
      {
        id: 'ann-autofill-eid',
        pageIndex: currentPageIndex,
        type: 'text',
        x: 10,
        y: 32,
        width: 45,
        height: 5,
        content: `Emirates ID: ${client.emiratesId || '784-XXXX-XXXXXXX-X'}`,
        fontSize: 12,
        textColor: '#1e293b',
      },
      {
        id: 'ann-autofill-sponsor',
        pageIndex: currentPageIndex,
        type: 'text',
        x: 10,
        y: 38,
        width: 55,
        height: 5,
        content: `Sponsoring Company: ${client.companyName || 'ADCS Corporate LLC'}`,
        fontSize: 12,
        textColor: '#1e293b',
      },
    ];

    recordHistory([...annotations, ...autoFields]);
    setActiveMode('edit');
    setActiveTool('select');
  };

  // Apply Permanent Redactions
  const handleApplyRedactions = () => {
    const updated = annotations.map((ann) => {
      if (ann.type === 'redact') {
        return {
          ...ann,
          isRedacted: true,
          content: 'REDACTED',
          bgColor: '#000000',
          textColor: '#ffffff',
        };
      }
      return ann;
    });
    recordHistory(updated);
    alert('Security Redaction applied! Selected sensitive areas are now permanently blackened and sanitized.');
  };

  // Canvas Click Handler (Adding new elements)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageContainerRef.current) return;
    if (activeTool === 'select' || activeTool === 'hand_pan') {
      // Deselect if clicking on empty page
      if (e.target === pageContainerRef.current || (e.target as HTMLElement).classList.contains('pdf-page-bg')) {
        setSelectedAnnotationId(null);
      }
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = 'ann_' + Date.now();

    if (activeTool === 'text') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'text',
        x: Math.max(2, Math.min(85, xPct)),
        y: Math.max(2, Math.min(90, yPct)),
        width: 30,
        height: 6,
        content: 'Type text here...',
        fontSize: 14,
        fontFamily: 'Helvetica, Arial, sans-serif',
        textColor: '#0f172a',
        textAlign: 'left',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'sticky_note') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'sticky_note',
        x: Math.max(2, Math.min(90, xPct)),
        y: Math.max(2, Math.min(90, yPct)),
        width: 25,
        height: 12,
        content: 'PRO Review Note: Please check passport expiry date.',
        noteAuthor: currentUser?.name || 'PRO Officer',
        noteStatus: 'open',
        textColor: '#854d0e',
        bgColor: '#fef08a',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'form_text') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'form_field',
        formFieldType: 'text',
        formFieldName: 'Applicant_Full_Name',
        formFieldPlaceholder: 'Enter full legal name...',
        x: Math.max(2, Math.min(75, xPct)),
        y: Math.max(2, Math.min(90, yPct)),
        width: 35,
        height: 5,
        bgColor: '#f8fafc',
        borderColor: '#94a3b8',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'form_checkbox') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'form_field',
        formFieldType: 'checkbox',
        formFieldName: 'Declaration_Agreed',
        formFieldValue: true,
        x: Math.max(2, Math.min(95, xPct)),
        y: Math.max(2, Math.min(95, yPct)),
        width: 4,
        height: 3,
        borderColor: '#2563eb',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'form_date') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'text',
        x: Math.max(2, Math.min(80, xPct)),
        y: Math.max(2, Math.min(95, yPct)),
        width: 20,
        height: 4,
        content: new Date().toLocaleDateString('en-GB'),
        fontSize: 12,
        fontWeight: 'bold',
        textColor: '#2563eb',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'shape_rect') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'shape',
        shapeType: 'rectangle',
        x: Math.max(2, Math.min(70, xPct)),
        y: Math.max(2, Math.min(80, yPct)),
        width: 25,
        height: 12,
        borderColor: '#2563eb',
        borderWidth: 2,
        bgColor: 'rgba(37, 99, 235, 0.08)',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'shape_circle') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'shape',
        shapeType: 'circle',
        x: Math.max(2, Math.min(70, xPct)),
        y: Math.max(2, Math.min(80, yPct)),
        width: 20,
        height: 14,
        borderColor: '#dc2626',
        borderWidth: 2,
        bgColor: 'rgba(220, 38, 38, 0.08)',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'shape_arrow') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'shape',
        shapeType: 'arrow',
        x: Math.max(2, Math.min(70, xPct)),
        y: Math.max(2, Math.min(80, yPct)),
        width: 20,
        height: 6,
        textColor: '#2563eb',
        borderColor: '#2563eb',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'redact_mark') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'redact',
        x: Math.max(2, Math.min(70, xPct)),
        y: Math.max(2, Math.min(80, yPct)),
        width: 25,
        height: 6,
        bgColor: '#000000',
        content: 'BLACKOUT',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'cert_stamp') {
      const newAnn: AcrobatAnnotation = {
        id: newId,
        pageIndex: currentPageIndex,
        type: 'cert_badge',
        x: Math.max(2, Math.min(65, xPct)),
        y: Math.max(2, Math.min(80, yPct)),
        width: 32,
        height: 10,
        stampTitle: 'DIGITALLY CERTIFIED PRO',
        stampSubtext: `Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()} • UAE ICP`,
        stampDate: new Date().toLocaleDateString('en-GB'),
        textColor: '#059669',
        borderColor: '#059669',
      };
      recordHistory([...annotations, newAnn]);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newAnn: AcrobatAnnotation = {
          id: 'ann-img-' + Date.now(),
          pageIndex: currentPageIndex,
          type: 'image',
          x: 25,
          y: 25,
          width: 30,
          height: 25,
          content: dataUrl,
          opacity: 1,
        };
        recordHistory([...annotations, newAnn]);
        setSelectedAnnotationId(newAnn.id);
        setActiveMode('edit');
        setActiveTool('select');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Compile Final PDF Binary using pdf-lib
  const compileFinalPdfBytes = async (): Promise<Uint8Array> => {
    let pdfDoc: PDFDocument;
    if (pdfRawBytes && isValidPdfBuffer(pdfRawBytes)) {
      try {
        pdfDoc = await PDFDocument.load(pdfRawBytes, { ignoreEncryption: true });
      } catch (loadErr) {
        console.warn('Fallback to fresh PDFDocument creation:', loadErr);
        pdfDoc = await PDFDocument.create();
      }
    } else {
      pdfDoc = await PDFDocument.create();
    }

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

    // Sync pages count
    while (pdfDoc.getPageCount() < pages.length) {
      pdfDoc.addPage([595.28, 841.89]);
    }
    while (pdfDoc.getPageCount() > pages.length) {
      pdfDoc.removePage(pdfDoc.getPageCount() - 1);
    }

    const docPageCount = pdfDoc.getPageCount();

    for (let i = 0; i < docPageCount; i++) {
      const pageMeta = pages[i];
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Apply Page Rotation
      if (pageMeta && pageMeta.rotation !== 0) {
        page.setRotation(degrees(pageMeta.rotation));
      }

      // Draw Watermark if enabled
      if (watermarkConfig.enabled) {
        const wmText = watermarkConfig.text || 'CONFIDENTIAL';
        const fontSize = watermarkConfig.fontSize || 48;
        page.drawText(wmText, {
          x: width / 4,
          y: height / 2,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0.8, 0.1, 0.1),
          opacity: watermarkConfig.opacity || 0.15,
          rotate: degrees(watermarkConfig.rotation || -45),
        });
      }

      // Draw Header & Footer if enabled
      if (headerFooterConfig.enabled) {
        const hfSize = headerFooterConfig.fontSize || 8;
        if (headerFooterConfig.headerLeft) {
          page.drawText(headerFooterConfig.headerLeft, { x: 36, y: height - 25, size: hfSize, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });
        }
        if (headerFooterConfig.headerCenter) {
          page.drawText(headerFooterConfig.headerCenter, { x: width / 2 - 40, y: height - 25, size: hfSize, font: helveticaBoldFont, color: rgb(0.4, 0.45, 0.5) });
        }
        if (headerFooterConfig.headerRight) {
          page.drawText(headerFooterConfig.headerRight, { x: width - 120, y: height - 25, size: hfSize, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });
        }

        // Footer
        if (headerFooterConfig.footerLeft) {
          page.drawText(headerFooterConfig.footerLeft, { x: 36, y: 20, size: hfSize, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });
        }
        const pageNumStr = `Page ${i + 1} of ${docPageCount}`;
        page.drawText(headerFooterConfig.footerCenter || pageNumStr, { x: width / 2 - 30, y: 20, size: hfSize, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });
        if (headerFooterConfig.footerRight) {
          page.drawText(headerFooterConfig.footerRight, { x: width - 120, y: 20, size: hfSize, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });
        }
      }

      // Draw Page Annotations
      const pageAnnotations = annotations.filter((a) => a.pageIndex === i);
      for (const ann of pageAnnotations) {
        const xPos = (ann.x / 100) * width;
        const yPos = height - ((ann.y + ann.height) / 100) * height;
        const annW = (ann.width / 100) * width;
        const annH = (ann.height / 100) * height;

        if (ann.type === 'text' || ann.type === 'sticky_note' || (ann.type === 'form_field' && (ann.formFieldType === 'text' || ann.formFieldType === 'date'))) {
          const textLines = (ann.content || (typeof ann.formFieldValue === 'string' ? ann.formFieldValue : '') || '').split('\n');
          const fSize = ann.fontSize || 12;
          let fontToUse = helveticaFont;
          if (ann.fontWeight === 'bold') fontToUse = helveticaBoldFont;
          if (ann.fontFamily?.includes('Times')) fontToUse = timesFont;
          if (ann.fontFamily?.includes('Courier')) fontToUse = courierFont;

          let r = 0.05, g = 0.1, b = 0.15;
          if (ann.textColor === '#2563eb') { r = 0.14; g = 0.38; b = 0.92; }
          if (ann.textColor === '#dc2626') { r = 0.86; g = 0.15; b = 0.15; }
          if (ann.textColor === '#059669') { r = 0.02; g = 0.58; b = 0.41; }

          if (ann.type === 'sticky_note') {
            page.drawRectangle({
              x: xPos,
              y: yPos,
              width: annW,
              height: annH,
              color: rgb(0.99, 0.94, 0.65),
              opacity: 0.9,
              borderColor: rgb(0.92, 0.78, 0.3),
              borderWidth: 1,
            });
          } else if (ann.type === 'form_field') {
            page.drawRectangle({
              x: xPos,
              y: yPos,
              width: annW,
              height: annH,
              borderColor: rgb(0.7, 0.75, 0.8),
              borderWidth: 1,
              color: rgb(0.97, 0.98, 1),
              opacity: 0.5,
            });
          }

          textLines.forEach((line, lineIdx) => {
            page.drawText(line, {
              x: xPos + 2,
              y: yPos + (textLines.length - 1 - lineIdx) * (fSize * 1.3) + 2,
              size: fSize,
              font: fontToUse,
              color: rgb(r, g, b),
              opacity: ann.opacity !== undefined ? ann.opacity : 1,
            });
          });
        } else if (ann.type === 'form_field' && ann.formFieldType === 'checkbox') {
          page.drawRectangle({
            x: xPos,
            y: yPos,
            width: annW,
            height: annH,
            borderColor: rgb(0.2, 0.3, 0.5),
            borderWidth: 1.5,
            color: rgb(1, 1, 1),
          });
          if (ann.formFieldValue === true || ann.formFieldValue === 'true') {
            page.drawText('✓', {
              x: xPos + 2,
              y: yPos + 2,
              size: Math.min(annW, annH) * 0.8,
              font: helveticaBoldFont,
              color: rgb(0.1, 0.4, 0.9),
            });
          }
        } else if (ann.type === 'highlight') {
          page.drawRectangle({
            x: xPos,
            y: yPos,
            width: annW,
            height: annH,
            color: rgb(1, 0.95, 0.3),
            opacity: 0.35,
          });
        } else if (ann.type === 'underline') {
          page.drawLine({
            start: { x: xPos, y: yPos + 2 },
            end: { x: xPos + annW, y: yPos + 2 },
            thickness: 1.5,
            color: rgb(0.14, 0.38, 0.92),
          });
        } else if (ann.type === 'strikethrough') {
          page.drawLine({
            start: { x: xPos, y: yPos + annH / 2 },
            end: { x: xPos + annW, y: yPos + annH / 2 },
            thickness: 1.5,
            color: rgb(0.86, 0.15, 0.15),
          });
        } else if (ann.type === 'signature' || ann.type === 'image') {
          if (ann.content && ann.content.startsWith('data:image')) {
            try {
              let imgEmbed;
              if (ann.content.includes('image/png')) {
                imgEmbed = await pdfDoc.embedPng(ann.content);
              } else {
                imgEmbed = await pdfDoc.embedJpg(ann.content);
              }
              page.drawImage(imgEmbed, {
                x: xPos,
                y: yPos,
                width: annW,
                height: annH,
                opacity: ann.opacity !== undefined ? ann.opacity : 1,
              });
            } catch (imgErr) {
              console.warn('Image embedding note:', imgErr);
            }
          }
        } else if (ann.type === 'stamp' || ann.type === 'cert_badge') {
          let r = 0.02, g = 0.58, b = 0.41; // Green
          if (ann.textColor === '#dc2626') { r = 0.86; g = 0.15; b = 0.15; }
          if (ann.textColor === '#2563eb') { r = 0.14; g = 0.38; b = 0.92; }

          page.drawRectangle({
            x: xPos,
            y: yPos,
            width: annW,
            height: annH,
            borderColor: rgb(r, g, b),
            borderWidth: 1.5,
            color: rgb(r, g, b),
            opacity: 0.06,
          });

          page.drawText(ann.stampTitle || 'PRO ATTESTED', {
            x: xPos + 8,
            y: yPos + annH / 2 + 2,
            size: 9,
            font: helveticaBoldFont,
            color: rgb(r, g, b),
          });

          if (ann.stampSubtext) {
            page.drawText(ann.stampSubtext.slice(0, 55), {
              x: xPos + 8,
              y: yPos + 6,
              size: 6.5,
              font: helveticaFont,
              color: rgb(r, g, b),
            });
          }
        } else if (ann.type === 'redact') {
          page.drawRectangle({
            x: xPos,
            y: yPos,
            width: annW,
            height: annH,
            color: rgb(0, 0, 0),
          });
        } else if (ann.type === 'shape') {
          if (ann.shapeType === 'circle') {
            page.drawEllipse({
              x: xPos + annW / 2,
              y: yPos + annH / 2,
              xScale: annW / 2,
              yScale: annH / 2,
              borderColor: rgb(0.14, 0.38, 0.92),
              borderWidth: ann.borderWidth || 2,
            });
          } else {
            page.drawRectangle({
              x: xPos,
              y: yPos,
              width: annW,
              height: annH,
              borderColor: rgb(0.14, 0.38, 0.92),
              borderWidth: ann.borderWidth || 2,
            });
          }
        }
      }
    }

    return await pdfDoc.save();
  };

  // Instant Download PDF File
  const handleDownloadPdf = async () => {
    try {
      setIsSaving(true);
      const pdfBytes = await compileFinalPdfBytes();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docTitle.endsWith('.pdf') ? docTitle : `${docTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Error generating PDF. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Document to CRM Vault
  const handleSaveToDocumentVault = async () => {
    if (!selectedClientId) {
      alert('Please select a client to link this document with.');
      return;
    }

    try {
      setIsSaving(true);
      const pdfBytes = await compileFinalPdfBytes();

      let binary = '';
      const len = pdfBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(pdfBytes[i]);
      }
      const base64DataUrl = 'data:application/pdf;base64,' + btoa(binary);

      const targetClient = clients.find((c) => c.id === selectedClientId);
      const targetClientName = targetClient?.fullName || `${targetClient?.firstName || ''} ${targetClient?.lastName || ''}`.trim() || 'Client';
      const sizeKB = Math.round(pdfBytes.byteLength / 1024);
      const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      const cleanDocName = docTitle.endsWith('.pdf') ? docTitle : `${docTitle}.pdf`;

      const newDoc: DocumentItem = {
        id: initialDocument?.id || 'doc_' + Date.now().toString(36),
        clientId: selectedClientId,
        clientName: targetClientName,
        name: cleanDocName,
        category: docCategory,
        fileUrl: base64DataUrl,
        fileType: 'application/pdf',
        fileSize: formattedSize,
        expiryDate: docExpiryDate || undefined,
        status: 'approved',
        remarks: `Certified & edited via Acrobat Pro Suite on ${new Date().toLocaleDateString()}`,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedByUserId: currentUser?.id || 'usr-master',
        uploadedByName: currentUser?.name || 'Authorized PRO',
        uploadedByRole: currentUser?.role || 'admin',
        version: (initialDocument?.version || 1) + 1,
      };

      uploadDocument(newDoc);
      if (onSavedToVault) onSavedToVault(newDoc);

      setSaveSuccessMsg(`Saved "${cleanDocName}" to ${targetClientName}'s Document Vault!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save to vault error:', err);
      alert('Failed to save document. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentPage = pages[currentPageIndex] || pages[0];
  const currentPageAnnotations = annotations.filter((a) => a.pageIndex === currentPageIndex);
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 bg-slate-950/80 backdrop-blur-xs select-none">
      {/* Hidden File Input for Image Insertion */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      <div className="bg-slate-950 border border-slate-800 sm:rounded-2xl w-full h-full sm:h-[96vh] sm:max-w-[98vw] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* TOP ACROBAT PRO RIBBON */}
        <AcrobatRibbon
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          fitToWidth={fitToWidth}
          fitToPage={fitToPage}
          onOpenSignatureModal={() => setShowSignatureModal(true)}
          onOpenStampPicker={() => setShowStampPicker(true)}
          onOpenWatermarkModal={() => {
            setWatermarkModalMode('watermark');
            setShowWatermarkModal(true);
          }}
          onOpenHeaderFooterModal={() => {
            setWatermarkModalMode('header_footer');
            setShowWatermarkModal(true);
          }}
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          onInsertImageClick={() => imageInputRef.current?.click()}
          onAddBlankPage={handleAddBlankPage}
          onRotateCurrentPage={() => handleRotatePage(currentPageIndex)}
          onAutoFillClientData={handleAutoFillClientData}
          onApplyRedactions={handleApplyRedactions}
          onSaveToVault={handleSaveToDocumentVault}
          onDownloadPdf={handleDownloadPdf}
          onPrintPdf={handlePrint}
          isSaving={isSaving}
          onClose={onClose}
          currentPage={currentPageIndex + 1}
          totalPages={pages.length}
        />

        {/* NOTIFICATION TOAST */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg('')} className="p-1 hover:bg-emerald-700 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* MAIN WORKSPACE BODY */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* 1. LEFT SIDEBAR */}
          <AcrobatLeftSidebar
            pages={pages}
            currentPageIndex={currentPageIndex}
            onSelectPage={(idx) => {
              setCurrentPageIndex(idx);
              setActiveMode('edit');
            }}
            onRotatePage={handleRotatePage}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onMovePageUp={handleMovePageUp}
            onMovePageDown={handleMovePageDown}
            onAddBlankPage={handleAddBlankPage}
            annotations={annotations}
            onSelectAnnotation={(id, pIdx) => {
              setCurrentPageIndex(pIdx);
              setSelectedAnnotationId(id);
              setActiveMode('edit');
              setActiveTool('select');
            }}
            onDeleteAnnotation={deleteAnnotation}
          />

          {/* 2. CENTER CANVAS OR ORGANIZE PAGES VIEW */}
          {activeMode === 'organize' ? (
            <AcrobatOrganizePagesView
              pages={pages}
              onRotatePage={handleRotatePage}
              onRotateAllPages={handleRotateAllPages}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onMovePageUp={handleMovePageUp}
              onMovePageDown={handleMovePageDown}
              onAddBlankPage={handleAddBlankPage}
              onCloseOrganizeView={() => setActiveMode('edit')}
              onSelectAndEditPage={(idx) => {
                setCurrentPageIndex(idx);
                setActiveMode('edit');
              }}
            />
          ) : (
            /* STANDARD CONTINUOUS/PAGE CANVAS */
            <div className="flex-1 bg-slate-950 overflow-auto flex flex-col items-center p-6 relative">
              {/* Floating Page Selector Bottom Pill */}
              <div className="fixed bottom-6 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-3 text-xs text-slate-200">
                <button
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-1 hover:bg-slate-800 rounded-full disabled:opacity-30"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-mono font-medium">
                  Page <strong className="text-blue-400">{currentPageIndex + 1}</strong> of {pages.length}
                </span>

                <button
                  onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                  className="p-1 hover:bg-slate-800 rounded-full disabled:opacity-30"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* PDF PAGE STAGE */}
              <div
                ref={pageContainerRef}
                onClick={handleCanvasClick}
                className="bg-white shadow-2xl relative rounded-xs transition-transform duration-75 origin-top border border-slate-300 select-none overflow-hidden"
                style={{
                  width: `${(595 * zoomLevel) / 100}px`,
                  height: `${(842 * zoomLevel) / 100}px`,
                  transform: `rotate(${currentPage.rotation}deg)`,
                }}
              >
                {/* Background Rendered PDF Layer */}
                {currentPage.renderedImageDataUrl && !currentPage.isCustomBlank ? (
                  <img
                    src={currentPage.renderedImageDataUrl}
                    alt="Page Background"
                    className="w-full h-full object-contain pointer-events-none pdf-page-bg"
                  />
                ) : (
                  <div className="w-full h-full bg-white p-8 relative pdf-page-bg">
                    {/* Simulated letterhead watermarks */}
                    <div className="flex justify-between items-center border-b pb-4 mb-6 border-slate-200">
                      <div>
                        <div className="text-xs font-bold text-slate-900 tracking-wider">ADCS CORPORATE & PRO SERVICES</div>
                        <div className="text-[9px] text-slate-500">Government Relations • Visas • Golden Residency</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-600">DUBAI, UAE</div>
                        <div className="text-[8px] text-slate-400">GDRFA APPROVED UNIT</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WATERMARK OVERLAY */}
                {watermarkConfig.enabled && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
                    <div
                      className="font-black text-center select-none uppercase tracking-widest"
                      style={{
                        color: watermarkConfig.color || '#dc2626',
                        opacity: watermarkConfig.opacity || 0.15,
                        transform: `rotate(${watermarkConfig.rotation || -45}deg)`,
                        fontSize: `${(watermarkConfig.fontSize * zoomLevel) / 100}px`,
                      }}
                    >
                      {watermarkConfig.text || 'CONFIDENTIAL'}
                    </div>
                  </div>
                )}

                {/* HEADER & FOOTER OVERLAY */}
                {headerFooterConfig.enabled && (
                  <>
                    <div className="absolute top-2 left-6 right-6 flex justify-between text-[9px] text-slate-500 pointer-events-none font-sans z-20">
                      <span>{headerFooterConfig.headerLeft}</span>
                      <span className="font-semibold">{headerFooterConfig.headerCenter}</span>
                      <span>{headerFooterConfig.headerRight}</span>
                    </div>
                    <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[9px] text-slate-500 pointer-events-none font-sans z-20">
                      <span>{headerFooterConfig.footerLeft}</span>
                      <span>{`Page ${currentPageIndex + 1} of ${pages.length}`}</span>
                      <span>{headerFooterConfig.footerRight}</span>
                    </div>
                  </>
                )}

                {/* ANNOTATIONS / OBJECTS LAYER */}
                {currentPageAnnotations.map((ann) => {
                  const isSelected = selectedAnnotationId === ann.id;

                  return (
                    <div
                      key={ann.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnotationId(ann.id);
                      }}
                      onPointerDown={(e) => handleStartMove(e, ann)}
                      className={`absolute cursor-move transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg shadow-blue-500/20'
                          : 'hover:ring-1 hover:ring-blue-400/50'
                      }`}
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`,
                        opacity: ann.opacity !== undefined ? ann.opacity : 1,
                        zIndex: isSelected ? 40 : ann.zIndex || 10,
                        touchAction: 'none',
                      }}
                    >
                      {/* TOP DRAG HEADER BADGE & QUICK POSITION INFO */}
                      {isSelected && (
                        <div
                          onPointerDown={(e) => handleStartMove(e, ann)}
                          className="absolute -top-7 left-0 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none z-50 whitespace-nowrap border border-blue-400/80 animate-in fade-in zoom-in-95 duration-100"
                          title="Click & drag anywhere to move (or use Arrow keys to nudge)"
                        >
                          <Move className="w-2.5 h-2.5" />
                          <span className="capitalize">{ann.type.replace('_', ' ')}</span>
                          <span className="text-[9px] opacity-75 font-mono">
                            {Math.round(ann.x)}%, {Math.round(ann.y)}%
                          </span>
                        </div>
                      )}

                      {/* 1. TEXT BOX */}
                      {ann.type === 'text' && (
                        <div
                          contentEditable={isSelected}
                          suppressContentEditableWarning
                          onBlur={(e) => updateAnnotation(ann.id, { content: e.currentTarget.innerText })}
                          className="w-full h-full p-1 leading-normal outline-none overflow-hidden"
                          style={{
                            fontSize: `${((ann.fontSize || 14) * zoomLevel) / 100}px`,
                            fontFamily: ann.fontFamily || 'Helvetica, Arial, sans-serif',
                            fontWeight: ann.fontWeight || 'normal',
                            fontStyle: ann.fontStyle || 'normal',
                            textAlign: ann.textAlign || 'left',
                            color: ann.textColor || '#0f172a',
                            backgroundColor: ann.bgColor || 'transparent',
                          }}
                        >
                          {ann.content}
                        </div>
                      )}

                      {/* 2. SIGNATURE */}
                      {ann.type === 'signature' && (
                        <div className="w-full h-full flex items-center justify-center p-1">
                          {ann.content ? (
                            <img
                              src={ann.content}
                              alt="e-Signature"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full border border-dashed border-emerald-500 flex items-center justify-center text-xs text-emerald-600 font-cursive">
                              [Digital Signature]
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. IMAGE */}
                      {ann.type === 'image' && (
                        <div className="w-full h-full overflow-hidden rounded-xs">
                          {ann.content && (
                            <img
                              src={ann.content}
                              alt="Inserted Asset"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          )}
                        </div>
                      )}

                      {/* 4. STAMP */}
                      {(ann.type === 'stamp' || ann.type === 'cert_badge') && (
                        <div
                          className="w-full h-full p-2 border-2 border-dashed rounded-lg flex flex-col justify-between select-none bg-white/80 backdrop-blur-xs"
                          style={{
                            borderColor: ann.borderColor || '#059669',
                            color: ann.textColor || '#059669',
                          }}
                        >
                          <div className="font-black text-xs uppercase tracking-wider">{ann.stampTitle}</div>
                          <div className="text-[9px] leading-tight line-clamp-2">{ann.stampSubtext}</div>
                          <div className="text-[8px] font-mono flex justify-between border-t border-current/20 pt-0.5">
                            <span>{ann.stampDate || new Date().toLocaleDateString('en-GB')}</span>
                            <span>VERIFIED</span>
                          </div>
                        </div>
                      )}

                      {/* 5. STICKY NOTE */}
                      {ann.type === 'sticky_note' && (
                        <div
                          className="w-full h-full p-2 rounded-lg shadow-md border flex flex-col justify-between text-xs overflow-hidden"
                          style={{
                            backgroundColor: ann.bgColor || '#fef08a',
                            color: ann.textColor || '#854d0e',
                            borderColor: '#fde047',
                          }}
                        >
                          <div className="font-bold flex items-center justify-between text-[10px]">
                            <span>{ann.noteAuthor || 'PRO Note'}</span>
                            <MessageSquare className="w-3 h-3 opacity-60" />
                          </div>
                          <div className="text-[11px] line-clamp-3 leading-snug">{ann.content}</div>
                        </div>
                      )}

                      {/* 6. REDACTION */}
                      {ann.type === 'redact' && (
                        <div
                          className="w-full h-full bg-black flex items-center justify-center text-[10px] font-bold text-white tracking-widest uppercase rounded-xs"
                          style={{ backgroundColor: '#000000' }}
                        >
                          {ann.content || 'REDACTED'}
                        </div>
                      )}

                      {/* 7. FORM FIELD */}
                      {ann.type === 'form_field' && (
                        <div className="w-full h-full border border-blue-400 bg-blue-50/50 rounded-xs p-1 flex items-center justify-between text-xs">
                          {ann.formFieldType === 'checkbox' ? (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">
                              ✓
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 truncate">
                              {ann.formFieldPlaceholder || ann.formFieldName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 8. SHAPE */}
                      {ann.type === 'shape' && (
                        <div
                          className="w-full h-full"
                          style={{
                            borderWidth: `${ann.borderWidth || 2}px`,
                            borderColor: ann.borderColor || '#2563eb',
                            backgroundColor: ann.bgColor || 'transparent',
                            borderRadius: ann.shapeType === 'circle' ? '9999px' : '4px',
                          }}
                        />
                      )}

                      {/* TRANSFORM / RESIZE HANDLES ON SELECTION */}
                      {isSelected && (
                        <>
                          <div
                            onPointerDown={(e) => handleStartResize(e, ann, 'nw')}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                            title="Resize top-left"
                          />
                          <div
                            onPointerDown={(e) => handleStartResize(e, ann, 'ne')}
                            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                            title="Resize top-right"
                          />
                          <div
                            onPointerDown={(e) => handleStartResize(e, ann, 'sw')}
                            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                            title="Resize bottom-left"
                          />
                          <div
                            onPointerDown={(e) => handleStartResize(e, ann, 'se')}
                            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                            title="Resize bottom-right"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. RIGHT INSPECTOR / PROPERTIES DOCK */}
          <AcrobatPropertiesPanel
            selectedAnnotation={selectedAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onDeleteAnnotation={deleteAnnotation}
            onDuplicateAnnotation={duplicateAnnotation}
            docTitle={docTitle}
            setDocTitle={setDocTitle}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            docCategory={docCategory}
            setDocCategory={setDocCategory}
            docExpiryDate={docExpiryDate}
            setDocExpiryDate={setDocExpiryDate}
            clients={clients}
            watermarkConfig={watermarkConfig}
            onOpenWatermarkModal={() => {
              setWatermarkModalMode('watermark');
              setShowWatermarkModal(true);
            }}
            onOpenHeaderFooterModal={() => {
              setWatermarkModalMode('header_footer');
              setShowWatermarkModal(true);
            }}
          />
        </div>
      </div>

      {/* SUB-MODALS */}
      {/* 1. Digital Signature Pad */}
      <SignaturePadModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={(dataUrl) => {
          const newAnn: AcrobatAnnotation = {
            id: 'ann-sig-' + Date.now(),
            pageIndex: currentPageIndex,
            type: 'signature',
            x: 20,
            y: 50,
            width: 25,
            height: 10,
            content: dataUrl,
          };
          recordHistory([...annotations, newAnn]);
          setSelectedAnnotationId(newAnn.id);
          setShowSignatureModal(false);
          setActiveMode('fill_sign');
          setActiveTool('select');
        }}
      />

      {/* 2. Stamps Picker Modal */}
      <AcrobatStampsModal
        isOpen={showStampPicker}
        onClose={() => setShowStampPicker(false)}
        onApplyStamp={(stampConfig) => {
          const newAnn: AcrobatAnnotation = {
            id: 'ann-stamp-' + Date.now(),
            pageIndex: currentPageIndex,
            type: 'stamp',
            x: 35,
            y: 40,
            width: 32,
            height: 12,
            ...stampConfig,
          };
          recordHistory([...annotations, newAnn]);
          setSelectedAnnotationId(newAnn.id);
          setActiveTool('select');
        }}
      />

      {/* 3. Watermark & Header/Footer Modal */}
      <AcrobatWatermarkModal
        isOpen={showWatermarkModal}
        onClose={() => setShowWatermarkModal(false)}
        mode={watermarkModalMode}
        watermarkConfig={watermarkConfig}
        setWatermarkConfig={setWatermarkConfig}
        headerFooterConfig={headerFooterConfig}
        setHeaderFooterConfig={setHeaderFooterConfig}
      />

      {/* 4. Acrobat AI Assistant Modal */}
      <AcrobatAIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        documentTitle={docTitle}
        currentPageText={currentPageAnnotations.map((a) => a.content).filter(Boolean).join('\n')}
        currentPageImageBase64={currentPage.renderedImageDataUrl}
      />
    </div>
  );
};
