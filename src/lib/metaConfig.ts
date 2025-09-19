// Meta Pixel and Google Tag Manager configuration

const META_CONFIG = {
  // Meta Pixel Configuration
  pixel: {
    id: '123456789012345', // Replace with your actual Meta Pixel ID
    events: {
      PageView: 'PageView',
      ViewContent: 'ViewContent',
      AddToCart: 'AddToCart',
      InitiateCheckout: 'InitiateCheckout',
      Purchase: 'Purchase',
      Lead: 'Lead'
    }
  },

  // Google Tag Manager Configuration
  gtm: {
    id: 'GTM-XXXXXXX', // Replace with your actual GTM ID
    events: {
      pageView: 'page_view',
      lead: 'generate_lead',
      checkout: 'begin_checkout',
      purchase: 'purchase'
    }
  },

  // Hotmart Configuration
  hotmart: {
    checkoutUrl: 'https://checkout.maracujazeropragas.com/VCCL1O8SC7KX', // Updated checkout URL
    productId: 'VCCL1O8SC7KX' // Updated product ID
  },

  // General tracking settings
  tracking: {
    enableDebug: process.env.NODE_ENV === 'development',
    enableAutoPageView: true,
    enableUserTracking: true,
    enableDebugLogs: process.env.NODE_ENV === 'development',
    enableViewContent: true,
    viewContentDelay: 2000
  },

  // Legacy tracking settings (for compatibility)
  TRACKING: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    enableViewContent: true,
    viewContentDelay: 2000
  }
};

// Helper function to get environment-specific configuration
export const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...META_CONFIG,
    isDevelopment,
    // Override values for development if needed
    ...(isDevelopment && {
      tracking: {
        ...META_CONFIG.tracking,
        enableDebug: true
      }
    })
  };
};

// Format user data for Meta
export const formatUserDataForMeta = (userData: any) => {
  return {
    em: userData.email ? userData.email.toLowerCase().trim() : '',
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : '',
    fn: userData.firstName ? userData.firstName.trim() : '',
    ln: userData.lastName ? userData.lastName.trim() : '',
    ct: userData.city || '',
    st: userData.state || '',
    zp: userData.zip || '',
    country: userData.country || 'BR'
  };
};

// Validate Meta configuration
export const validateMetaConfig = () => {
  const issues = [];
  
  if (!META_CONFIG.pixel.id || META_CONFIG.pixel.id === '123456789012345') {
    issues.push('Meta Pixel ID não configurado');
  }
  
  if (!META_CONFIG.gtm.id || META_CONFIG.gtm.id === 'GTM-XXXXXXX') {
    issues.push('GTM ID não configurado');
  }
  
  if (!META_CONFIG.hotmart.checkoutUrl || META_CONFIG.hotmart.checkoutUrl === 'https://pay.hotmart.com/XXXXXX') {
    issues.push('Hotmart checkout URL não configurado');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export default META_CONFIG;