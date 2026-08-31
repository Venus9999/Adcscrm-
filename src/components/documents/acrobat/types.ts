export type AcrobatMode =
  | 'edit'
  | 'comment'
  | 'organize'
  | 'fill_sign'
  | 'forms'
  | 'protect'
  | 'ai'
  | 'overview';

export type AcrobatTool =
  | 'select'
  | 'hand_pan'
  | 'text'
  | 'image'
  | 'signature'
  | 'initials'
  | 'stamp'
  | 'pencil'
  | 'eraser'
  | 'highlighter'
  | 'underline'
  | 'strikethrough'
  | 'sticky_note'
  | 'callout'
  | 'shape_rect'
  | 'shape_circle'
  | 'shape_line'
  | 'shape_arrow'
  | 'shape_cloud'
  | 'measurement'
  | 'form_text'
  | 'form_checkbox'
  | 'form_radio'
  | 'form_dropdown'
  | 'form_date'
  | 'form_signature'
  | 'redact_mark'
  | 'redact_apply'
  | 'cert_stamp'
  | 'watermark'
  | 'header_footer';

export interface AcrobatCommentThread {
  id: string;
  author: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface AcrobatAnnotation {
  id: string;
  pageIndex: number;
  type:
    | 'text'
    | 'image'
    | 'signature'
    | 'initials'
    | 'stamp'
    | 'drawing'
    | 'highlight'
    | 'underline'
    | 'strikethrough'
    | 'sticky_note'
    | 'callout'
    | 'shape'
    | 'measurement'
    | 'form_field'
    | 'redact'
    | 'cert_badge';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
  rotation?: number;
  content?: string; // Text content, image dataUrl, or signature dataUrl
  lines?: { x: number; y: number }[]; // For freehand drawing & highlighting
  
  // Typography
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  lineHeight?: number;
  letterSpacing?: number;

  // Colors & Borders
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  opacity?: number;
  strokeWidth?: number;

  // Shapes & Visuals
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow' | 'cloud';
  arrowStart?: boolean;
  arrowEnd?: boolean;

  // Stamps & Seals
  stampType?: 'approved' | 'confidential' | 'received' | 'urgent' | 'verified' | 'certified_pro' | 'mofa_attested';
  stampTitle?: string;
  stampSubtext?: string;
  stampDate?: string;
  stampRefNo?: string;

  // Form Fields
  formFieldType?: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'signature';
  formFieldName?: string;
  formFieldValue?: string | boolean;
  formFieldOptions?: string[];
  formFieldRequired?: boolean;
  formFieldPlaceholder?: string;

  // Sticky Notes & Comments
  noteColor?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  noteAuthor?: string;
  noteStatus?: 'open' | 'resolved' | 'rejected';
  noteThreads?: AcrobatCommentThread[];
  isOpen?: boolean;

  // Redaction
  isRedacted?: boolean;
  redactionReason?: string;
  redactionFillColor?: string;

  // Measurement & Callout
  measureValue?: string;
  calloutPoint?: { x: number; y: number };

  // Layer order
  zIndex?: number;
  locked?: boolean;
}

export interface AcrobatPageMeta {
  pageNumber: number;
  rotation: number;
  width: number;
  height: number;
  renderedImageDataUrl?: string;
  isCustomBlank?: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number; // e.g. -45 degrees
  position: 'diagonal' | 'center' | 'top' | 'bottom';
  allPages: boolean;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  fontSize: number;
  color: string;
  includePageNumbers: boolean;
}
