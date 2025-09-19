import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// General utility functions

// Class name utility for shadcn/ui components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export const formatCurrency = (amount: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (date: Date | string, format: string = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: format as any,
    timeStyle: format === 'full' ? 'short' : undefined
  }).format(dateObj);
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Brazilian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

// Clean and format phone number
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Get URL parameters
export const getUrlParams = (url: string = window.location.href): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlSearchParams = new URLSearchParams(url.split('?')[1]);
  
  for (const [key, value] of urlSearchParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

// Create URL with parameters
export const createUrlWithParams = (baseUrl: string, params: Record<string, string>): string => {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
};

// Local storage helpers
export const storage = {
  get: (key: string): any => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Session storage helpers
export const session = {
  get: (key: string): any => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to sessionStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Scroll to element
export const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth'): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior });
  }
};

// Check if element is in viewport
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Get device type
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Get operating system
export const getOS = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent;
  
  if (userAgent.indexOf('Windows') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
  if (userAgent.indexOf('X11') !== -1) return 'UNIX';
  if (userAgent.indexOf('Linux') !== -1) return 'Linux';
  if (/Android/.test(userAgent)) return 'Android';
  if (/like Mac OS X/.test(userAgent)) return 'iOS';
  
  return 'unknown';
};

// Get browser name
export const getBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent;
  
  if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
  if (userAgent.indexOf('Safari') !== -1) return 'Safari';
  if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
  if (userAgent.indexOf('Edge') !== -1) return 'Edge';
  if (userAgent.indexOf('Opera') !== -1) return 'Opera';
  
  return 'unknown';
};