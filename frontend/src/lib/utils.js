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
