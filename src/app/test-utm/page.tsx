'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle, Copy, Eye } from 'lucide-react';
import { getStoredUTMParameters, getFacebookCookies, getGoogleClientId } from '@/lib/cookies';

export default function TestUTMPage() {
  const [utmParams, setUtmParams] = useState<any>({});
  const [facebookCookies, setFacebookCookies] = useState<any>({});
  const [gaClientId, setGaClientId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [copied, setCopied] = useState<string>('');

  useEffect(() => {
    // Capturar parâmetros atuais
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      setUtmParams(getStoredUTMParameters());
      setFacebookCookies(getFacebookCookies());
      setGaClientId(getGoogleClientId());
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateTestUrls = () => {
    const baseUrl = window.location.origin;
    return [
      {
        name: 'Facebook Ads',
        url: `${baseUrl}/test-utm?utm_source=FB&utm_campaign=Venda_Tenis|123456789&utm_medium=Mobile_Users|987654321&utm_content=Video_Demo|456789123&utm_term=feed`
      },
      {
        name: 'Google Ads',
        url: `${baseUrl}/test-utm?utm_source=google&utm_medium=cpc&utm_campaign=campanha_google&utm_content=anuncio_texto&utm_term=palavra_chave`
      },
      {
        name: 'Email Marketing',
        url: `${baseUrl}/test-utm?utm_source=newsletter&utm_medium=email&utm_campaign=campanha_email&utm_content=boletim_semanal`
      },
      {
        name: 'Orgânico',
        url: `${baseUrl}/test-utm`
      }
    ];
  };

  const testUrls = generateTestUrls();

  const hasUTM = Object.values(utmParams).some(value => value !== null);
  const hasFacebookCookies = Object.values(facebookCookies).some(value => value !== null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Rastreamento UTM
          </h1>
          <p className="text-gray-600">
            Verifique se os parâmetros UTM estão sendo capturados e armazenados corretamente
          </p>
        </div>

        {/* URL Atual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              URL Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
              {currentUrl}
            </div>
          </CardContent>
        </Card>

        {/* Status dos Parâmetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* UTM Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasUTM ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                Parâmetros UTM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(utmParams).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <div className="flex items-center gap-2">
                      {value ? (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            {value}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(value, key)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Não encontrado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facebook Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasFacebookCookies ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                Facebook Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(facebookCookies).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <div className="flex items-center gap-2">
                      {value ? (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            {value.substring(0, 20)}...
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(value, key)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Não encontrado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">GA Client ID:</span>
                  <div className="flex items-center gap-2">
                    {gaClientId ? (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {gaClientId}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(gaClientId!, 'ga_client_id')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Não encontrado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URLs de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>URLs de Teste</CardTitle>
            <p className="text-sm text-gray-600">
              Clique nos links abaixo para testar diferentes fontes de tráfego com parâmetros UTM
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testUrls.map((testUrl, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{testUrl.name}</div>
                    <div className="text-xs text-gray-600 font-mono break-all">
                      {testUrl.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(testUrl.url, testUrl.name)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                    <a
                      href={testUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Testar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Quando você acessa a página com parâmetros UTM na URL, eles são automaticamente capturados e armazenados em localStorage e cookies.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Os parâmetros persistem durante a navegação, mesmo entre diferentes páginas.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Quando o formulário de pré-checkout é aberto, campos ocultos com os parâmetros UTM são adicionados automaticamente.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Na finalização da compra, os parâmetros UTM são incluídos na URL do checkout para rastreamento completo.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            ✅ {copied} copiado para a área de transferência!
          </div>
        )}
      </div>
    </div>
  );
}