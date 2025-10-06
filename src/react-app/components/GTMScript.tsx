import { useEffect } from 'react';

interface GTMScriptProps {
  gtmId?: string;
}

export default function GTMScript({ gtmId = 'GTM-567XZCDX' }: GTMScriptProps) {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // GTM initialization
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Load GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    // Push initial data
    window.dataLayer.push({
      event: 'gtm_loaded',
      page_type: 'landing_page',
      product_category: 'agricultural_education',
      traffic_source: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
    });

    return () => {
      // Cleanup script if needed
      const existingScript = document.querySelector(`script[src*="${gtmId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [gtmId]);

  return (
    <>
      {/* GTM noscript fallback */}
      <noscript>
        <iframe 
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
