'use client';

import { useState } from 'react';

export default function TestFacebookPixel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFacebookPixel = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const testData = {
        event_name: 'InitiateCheckout',
        event_id: 'test-' + Date.now(),
        pixel_id: '642933108377475',
        user_data: {
          em: 'test@example.com',
          ph: '11999999999',
          fn: 'Test',
          ln: 'User',
          ct: 'São Paulo',
          st: 'SP',
          zp: '01310100',
          country: 'BR',
          client_user_agent: navigator.userAgent,
          fbc: 'fb.1.' + Date.now() + '.IwAR2eX8Z7Y9w1L4K6P3Q8R5Thbau84W6X9Y2Z3A7B8C1D2E3F4G5H6I7J8K9L0',
          fbp: 'fb.1.' + Date.now() + '.1966718365'
        },
        custom_data: {
          currency: 'BRL',
          value: 39.90,
          content_name: 'E-book Sistema de Controle de Trips',
          content_category: 'E-book',
          content_ids: ['ebook-controle-trips'], // ✅ ARRAY
          num_items: '1',
          items: [{ // ✅ ARRAY
            item_id: 'ebook-controle-trips',
            item_name: 'E-book Sistema de Controle de Trips',
            quantity: 1,
            price: 39.90,
            item_category: 'E-book',
            item_brand: 'Maracujá Zero Pragas',
            currency: 'BRL'
          }]
        }
      };

      console.log('🚀 Enviando teste:', JSON.stringify(testData, null, 2));

      const response = await fetch('/api/facebook-pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      
      console.log('📊 Resposta:', data);
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(`Erro ${response.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Facebook Pixel API</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <p className="text-gray-600 mb-4">
            This test will send a sample InitiateCheckout event to our Facebook Pixel API endpoint 
            to verify that the data formatting is correct.
          </p>
          
          <button
            onClick={testFacebookPixel}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Sending...' : 'Test Facebook Pixel'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Success</h3>
            <pre className="text-green-600 whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">What this test verifies:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ content_ids is sent as array, not JSON string</li>
            <li>✅ items is sent as array, not JSON string</li>
            <li>✅ All user data fields are properly formatted</li>
            <li>✅ Facebook API accepts the formatted data</li>
            <li>✅ Server-side processing works correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}