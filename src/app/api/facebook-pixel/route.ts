import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Função para criar hash SHA-256
function sha256(str: string): string {
  return createHash('sha256').update(str.normalize('NFKC')).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Recebido dados do Facebook Pixel:', JSON.stringify(body, null, 2));
    
    // Extrair dados do evento
    const { event_name, event_id, pixel_id, user_data, custom_data } = body;
    
    // Preparar dados do usuário com hash SHA-256
    const hashedUserData = {
      // Dados do usuário com hash - OBRIGATÓRIO para Facebook
      ...(user_data.em && { em: sha256(user_data.em.toLowerCase().trim()) }),
      ...(user_data.ph && { ph: sha256(user_data.ph.replace(/\D/g, '')) }),
      ...(user_data.fn && { fn: sha256(user_data.fn.trim()) }),
      ...(user_data.ln && { ln: sha256(user_data.ln.trim()) }),
      ...(user_data.ct && { ct: sha256(user_data.ct.trim()) }),
      ...(user_data.st && { st: sha256(user_data.st.trim().toUpperCase()) }),
      ...(user_data.zp && { zp: sha256(user_data.zp.replace(/\D/g, '')) }),
      ...(user_data.country && { country: sha256(user_data.country) }),
      
      // Dados de rastreamento - SEM hash (não precisam)
      ...(user_data.client_ip_address && { client_ip_address: user_data.client_ip_address }),
      ...(user_data.client_user_agent && { client_user_agent: user_data.client_user_agent }),
      ...(user_data.fbc && { fbc: user_data.fbc }),
      ...(user_data.fbp && { fbp: user_data.fbp }),
      ...(user_data.external_id && { external_id: user_data.external_id }),
    };
    
    // Preparar dados no formato EXATO que o Facebook API espera
    const facebookEventData = {
      data: [{
        event_name: event_name,
        event_id: event_id,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: hashedUserData,
        custom_data: {
          // Dados customizados - GARANTIR QUE ARRAYS SEJAM ARRAYS, NÃO STRINGS
          currency: custom_data.currency || 'BRL',
          value: custom_data.value || 39.90,
          content_name: custom_data.content_name || 'E-book Sistema de Controle de Trips',
          content_category: custom_data.content_category || 'E-book',
          
          // ✅ CRÍTICO: Garantir que content_ids seja ARRAY, não string JSON
          content_ids: Array.isArray(custom_data.content_ids) 
            ? custom_data.content_ids 
            : typeof custom_data.content_ids === 'string'
              ? [custom_data.content_ids] // Se for string simples, converter para array
              : custom_data.content_ids || ['ebook-controle-trips'],
          
          num_items: String(custom_data.num_items || '1'),
          
          // ✅ CRÍTICO: Garantir que items seja ARRAY, não string JSON
          items: Array.isArray(custom_data.items)
            ? custom_data.items
            : typeof custom_data.items === 'string'
              ? [custom_data.items] // Se for string simples, converter para array
              : custom_data.items || [{
                  item_id: 'ebook-controle-trips',
                  item_name: 'E-book Sistema de Controle de Trips',
                  quantity: 1,
                  price: 39.90,
                  item_category: 'E-book',
                  item_brand: 'Maracujá Zero Pragas',
                  currency: 'BRL'
                }],
        },
        event_source_url: request.headers.get('referer') || 'https://www.maracujazeropragas.com',
        referrer_url: request.headers.get('referer') || 'https://www.maracujazeropragas.com',
      }]
    };
    
    // Log dos dados formatados para depuração
    console.log('📤 Dados formatados para Facebook API:', JSON.stringify(facebookEventData, null, 2));
    console.log('🔐 Dados do usuário com hash:', {
      em: user_data.em ? `${user_data.em} -> ${hashedUserData.em}` : 'N/A',
      ph: user_data.ph ? `${user_data.ph} -> ${hashedUserData.ph}` : 'N/A',
      fn: user_data.fn ? `${user_data.fn} -> ${hashedUserData.fn}` : 'N/A',
      ln: user_data.ln ? `${user_data.ln} -> ${hashedUserData.ln}` : 'N/A',
      ct: user_data.ct ? `${user_data.ct} -> ${hashedUserData.ct}` : 'N/A',
      st: user_data.st ? `${user_data.st} -> ${hashedUserData.st}` : 'N/A',
      zp: user_data.zp ? `${user_data.zp} -> ${hashedUserData.zp}` : 'N/A',
      country: user_data.country ? `${user_data.country} -> ${hashedUserData.country}` : 'N/A',
    });
    
    // Enviar para Facebook Conversion API
    const facebookResponse = await fetch(`https://graph.facebook.com/v23.0/${pixel_id}/events?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facebookEventData)
    });
    
    const facebookResult = await facebookResponse.json();
    
    console.log('📊 Resposta do Facebook:', facebookResult);
    
    if (facebookResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Evento enviado com sucesso para Facebook',
        facebookResponse: facebookResult,
        hashedData: hashedUserData
      });
    } else {
      console.error('❌ Erro ao enviar evento para Facebook:', facebookResult);
      return NextResponse.json({
        success: false,
        message: 'Erro ao enviar evento para Facebook',
        error: facebookResult,
        hashedData: hashedUserData
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Erro no processamento do evento:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno no servidor',
      error: error.message
    }, { status: 500 });
  }
}