'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    advancedTracking?: {
      checkTrackingStatus: () => void;
      testPageView: () => void;
    };
    dataLayer?: any[];
    fbq?: any;
  }
}

export default function TestTrackingPage() {
  useEffect(() => {
    console.log('🧪 Test page loaded');
    
    // Test if tracking functions are available
    setTimeout(() => {
      if (window.advancedTracking) {
        console.log('✅ advancedTracking available');
        window.advancedTracking.checkTrackingStatus();
        window.advancedTracking.testPageView();
      } else {
        console.log('❌ advancedTracking not available');
      }
      
      // Test dataLayer
      if (window.dataLayer) {
        console.log('✅ dataLayer available:', window.dataLayer.length, 'items');
      } else {
        console.log('❌ dataLayer not available');
      }
      
      // Test fbq
      if (window.fbq) {
        console.log('✅ fbq available');
      } else {
        console.log('❌ fbq not available');
      }
    }, 3000);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Tracking Page</h1>
      <p>Check console for tracking debug information.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Manual Tests:</h2>
        <button 
          onClick={() => {
            console.log('🧪 Manual PageView test...');
            if (window.advancedTracking) {
              window.advancedTracking.testPageView();
            }
          }}
          style={{ margin: '5px', padding: '10px' }}
        >
          Test PageView
        </button>
        
        <button 
          onClick={() => {
            console.log('🧪 Manual status check...');
            if (window.advancedTracking) {
              window.advancedTracking.checkTrackingStatus();
            }
          }}
          style={{ margin: '5px', padding: '10px' }}
        >
          Check Status
        </button>
        
        <button 
          onClick={() => {
            console.log('🧪 Direct fbq test...');
            if (window.fbq) {
              window.fbq('track', 'PageView', {}, {
                eventID: `manual_test_${Date.now()}`
              });
              console.log('✅ Direct PageView sent');
            } else {
              console.log('❌ fbq not available');
            }
          }}
          style={{ margin: '5px', padding: '10px' }}
        >
          Direct FB Test
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser console</li>
          <li>Wait 3 seconds for automatic tests</li>
          <li>Click manual test buttons</li>
          <li>Check for PageView events in Network tab</li>
        </ol>
      </div>
    </div>
  );
}