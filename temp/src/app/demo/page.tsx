'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTracking } from '@/components/tracking-provider';

export default function DemoPage() {
  const { trackEvent } = useTracking();
  const [isTracking, setIsTracking] = useState(false);

  const handleViewContent = async () => {
    setIsTracking(true);
    await trackEvent('ViewContent', {
      productName: 'E-book Sistema de Controle de Trips',
      productCategory: 'E-book',
      productId: '6080425',
      price: 39.90
    });
    setIsTracking(false);
  };

  const handleInitiateCheckout = async () => {
    setIsTracking(true);
    await trackEvent('InitiateCheckout', {
      value: 39.90,
      currency: 'BRL'
    });
    setIsTracking(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Facebook Pixel Tracking Demo</h1>
          <p className="text-lg text-muted-foreground">
            Teste o rastreamento de eventos com FBC garantido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Produto Demonstrativo</CardTitle>
              <CardDescription>
                E-book Sistema de Controle de Trips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Imagem do Produto</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">R$ 39,90</p>
                <p className="text-sm text-muted-foreground">
                  Aprenda a controlar suas viagens com eficiência
                </p>
              </div>
              <Button 
                onClick={handleViewContent} 
                disabled={isTracking}
                className="w-full"
              >
                {isTracking ? 'Rastreando...' : 'Ver Detalhes (ViewContent)'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações de Rastreamento</CardTitle>
              <CardDescription>
                Teste diferentes eventos do Facebook Pixel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Eventos Disponíveis:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PageView (automático na entrada)</li>
                  <li>• ViewContent (ao visualizar produto)</li>
                  <li>• InitiateCheckout (ao iniciar compra)</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleInitiateCheckout} 
                disabled={isTracking}
                variant="outline"
                className="w-full"
              >
                {isTracking ? 'Rastreando...' : 'Iniciar Compra (InitiateCheckout)'}
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Status do FBC:</p>
                <div className="space-y-1 text-xs">
                  <p>✓ Capturado da URL (fbclid)</p>
                  <p>✓ Armazenado em cookie</p>
                  <p>✓ Enviado em todos os eventos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Depuração</CardTitle>
            <CardDescription>
              Verifique o console do navegador para logs dos eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">O que foi corrigido:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ FBC agora é capturado corretamente</li>
                  <li>✓ FBC é enviado em todos os eventos</li>
                  <li>✓ Cookie _fbc é gerenciado automaticamente</li>
                  <li>✓ Suporte a fbclid na URL</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Como testar:</h4>
                <ul className="text-sm space-y-1">
                  <li>1. Adicione ?fbclid=TEST123 à URL</li>
                  <li>2. Clique nos botões acima</li>
                  <li>3. Verifique o console</li>
                  <li>4. Confira no Facebook Events Manager</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
