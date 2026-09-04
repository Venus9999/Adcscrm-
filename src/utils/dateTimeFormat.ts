/**
 * Central Date & Time Formatting Utilities for ADCS CRM
 * Ensures consistent, clean, and legible Date and Time formatting across all
 * transactions, leads, clients, work pipeline stages, and invoices.
 */

export function formatDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    // If it's pure YYYY-MM-DD, convert to standard date
    let raw = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      // Append midday to prevent UTC timezone drift
      raw = `${raw}T12:00:00`;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(dateInput);
    
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }); // e.g., "04 Sep 2026, 11:30 AM"
  } catch {
    return String(dateInput);
  }
}

export function formatDateOnly(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    let raw = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      raw = `${raw}T12:00:00`;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }); // e.g., "04 Sep 2026"
  } catch {
    return String(dateInput);
  }
}

export function formatTimeOnly(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }); // e.g., "11:30 AM"
  } catch {
    return '';
  }
}

export function toDateTimeLocalString(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

export function ensureDateTimeString(dateInput?: string | null): string {
  if (!dateInput) return new Date().toISOString();
  const trimmed = dateInput.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const now = new Date();
    const timePart = now.toTimeString().split(' ')[0]; // HH:mm:ss
    return `${trimmed}T${timePart}`;
  }
  return trimmed;
}
