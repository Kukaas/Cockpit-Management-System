import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Browser detection utility
export function detectBrowser() {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent;

  // Check for Brave browser
  if (navigator.brave && navigator.brave.isBrave()) {
    return 'brave';
  }

  // Check for Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('Safari')) {
    return 'chrome';
  }

  // Check for Edge
  if (userAgent.includes('Edg')) {
    return 'edge';
  }

  // Check for Firefox
  if (userAgent.includes('Firefox')) {
    return 'firefox';
  }

  // Check for Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'safari';
  }

  return 'unknown';
}

// Check if browser supports native select styling
export function shouldUseNativeSelect() {
  const browser = detectBrowser();
  return browser === 'chrome' || browser === 'edge';
}

// Date format utility MM/DD/YYYY
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Date and Time format utility "January 4, 2026 at 10:00 AM"
export function formatDateTime(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr} at ${timeStr}`;
}
