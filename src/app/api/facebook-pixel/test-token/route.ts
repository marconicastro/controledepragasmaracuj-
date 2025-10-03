import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pixelId } = await request.json();
    
    if (!accessToken || !pixelId) {
      return NextResponse.json({
        success: false,
        error: 'Access token e pixel ID são obrigatórios'
      }, { status: 400 });
    }

    console.log('🧪 Testando Facebook Access Token...');
    console.log('Pixel ID:', pixelId);
    console.log('Token:', accessToken.substring(0, 20) + '...');

    // Testar a conexão com a API do Facebook
    const testResponse = await fetch(`https://graph.facebook.com/v23.0/${pixelId}?access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const testData = await testResponse.json();

    console.log('📊 Resposta do teste:', testData);

    if (testResponse.ok) {
      // Testar também envio de evento
      const eventData = {
        data: [{
          event_name: 'TestEvent',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            client_ip_address: '127.0.0.1',
            client_user_agent: 'Test Agent'
          }
        }]
      };

      const eventResponse = await fetch(`https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      const eventResult = await eventResponse.json();

      console.log('📊 Resposta do evento de teste:', eventResult);

      return NextResponse.json({
        success: true,
        message: 'Token válido e funcionando',
        pixelInfo: testData,
        eventTest: eventResult,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testData.error || 'Erro ao testar token',
        details: testData,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro no teste do token:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}