// Cookie utilities for tracking and analytics

// Get Facebook cookies
export const getFacebookCookies = () => {
  if (typeof window === 'undefined') {
    return {
      fbc: '',
      fbp: ''
    };
  }

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  return {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp')
  };
};

// Get Google Client ID
export const getGoogleClientId = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  return getCookie('_ga')?.replace('GA1.1.', '') || '';
};

// Set a cookie
export const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof window === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Get a cookie by name
export const getCookie = (name: string) => {
  if (typeof window === 'undefined') return '';

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

// Delete a cookie
export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

// Initialize tracking
export const initializeTracking = () => {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Initialize Facebook tracking
  if (typeof window.fbq === 'undefined') {
    window.fbq = function(...args: any[]) {
      window.dataLayer.push(args);
    };
    window.fbq.version = '2.0';
    window.fbq.queue = [];
  }
};

// Get all tracking parameters
export const getAllTrackingParams = async () => {
  if (typeof window === 'undefined') {
    return {
      fbc: '',
      fbp: '',
      ga_client_id: '',
      external_id: ''
    };
  }

  const facebookCookies = getFacebookCookies();
  const gaClientId = getGoogleClientId();
  
  // Try to get external_id from localStorage or generate one
  let external_id = localStorage.getItem('external_id');
  if (!external_id) {
    external_id = generateId();
    localStorage.setItem('external_id', external_id);
  }

  return {
    fbc: facebookCookies.fbc,
    fbp: facebookCookies.fbp,
    ga_client_id: gaClientId,
    external_id: external_id
  };
};

// Get cached geographic data
export const getCachedGeographicData = () => {
  if (typeof window === 'undefined') {
    return {
      city: '',
      state: '',
      zip: '',
      country: 'BR'
    };
  }

  const cached = localStorage.getItem('geographic_data');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached geographic data:', error);
    }
  }

  return {
    city: '',
    state: '',
    zip: '',
    country: 'BR'
  };
};

// Get high quality location data
export const getHighQualityLocationData = async () => {
  if (typeof window === 'undefined') {
    return {
      city: '',
      state: '',
      zip: '',
      country: 'BR'
    };
  }

  // Try to get from cache first
  const cached = getCachedGeographicData();
  if (cached.city || cached.state || cached.zip) {
    return cached;
  }

  // Try to get from browser geolocation API
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: true
      });
    });

    // In a real implementation, you would reverse geocode the coordinates
    // For now, return empty values
    return {
      city: '',
      state: '',
      zip: '',
      country: 'BR'
    };
  } catch (error) {
    console.log('Geolocation not available or denied');
    return {
      city: '',
      state: '',
      zip: '',
      country: 'BR'
    };
  }
};

// Validate data quality
export const validateDataQuality = (userData: any) => {
  let score = 0;
  const issues = [];
  const recommendations = [];

  // Check tracking data
  if (userData.fbc) score += 30;
  else issues.push('FBC não encontrado');

  if (userData.fbp) score += 20;
  else issues.push('FBP não encontrado');

  if (userData.ga_client_id) score += 10;
  else issues.push('Google Client ID não encontrado');

  if (userData.external_id) score += 10;
  else issues.push('External ID não encontrado');

  // Check location data
  if (userData.ct && userData.ct.length > 2) score += 10;
  else {
    issues.push('Cidade não encontrada');
    recommendations.push('Forneça a cidade para melhorar o matching');
  }

  if (userData.st && userData.st.length > 1) score += 10;
  else {
    issues.push('Estado não encontrado');
    recommendations.push('Forneça o estado para melhorar o matching');
  }

  if (userData.zp && userData.zp.length >= 8) score += 10;
  else {
    issues.push('CEP não encontrado');
    recommendations.push('Forneça o CEP para melhorar o matching');
  }

  // Maximum score is 100
  const maxScore = 100;

  return {
    score: Math.min(score, maxScore),
    isValid: score >= 70, // Consider valid if score is 70% or higher
    issues,
    recommendations
  };
};

// Helper function to generate unique ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};