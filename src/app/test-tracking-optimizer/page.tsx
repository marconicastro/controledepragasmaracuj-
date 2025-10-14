'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function TestTrackingOptimizer() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    email: 'joao.silva@exemplo.com',
    phone: '11987654321',
    firstName: 'João',
    lastName: 'Silva',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100'
  });

  useEffect(() => {
    // Executar validação rápida ao carregar
    setTimeout(() => {
      handleQuickValidation();
    }, 2000);
  }, []);

  const handleRunDiagnostic = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && window.advancedTracking) {
        const result = await window.advancedTracking.runDiagnostic();
        setDiagnostic(result);
      }
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickValidation = async () => {
    try {
      if (typeof window !== 'undefined' && window.advancedTracking) {
        const result = await window.advancedTracking.quickValidation();
        setValidation(result);
      }
    } catch (error) {
      console.error('Erro na validação rápida:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (typeof window !== 'undefined' && window.advancedTracking) {
        const result = window.advancedTracking.generateReport();
        setReport(result);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const handleTestExternalId = async () => {
    try {
      if (typeof window !== 'undefined' && window.advancedTracking) {
        const result = await window.advancedTracking.testExternalId(testData);
        console.log('External ID gerado:', result);
      }
    } catch (error) {
      console.error('Erro ao testar external_id:', error);
    }
  };

  const handleTestCheckout = () => {
    if (typeof window !== 'undefined' && window.advancedTracking) {
      window.advancedTracking.testCheckout();
    }
  };

  const handleTestFbclidCapture = () => {
    if (typeof window !== 'undefined' && window.advancedTracking) {
      window.advancedTracking.testFbclidCapture();
    }
  };

  const handleCheckStatus = () => {
    if (typeof window !== 'undefined' && window.advancedTracking) {
      window.advancedTracking.checkTrackingStatus();
    }
  };

  const testFbclidUrl = () => {
    const testUrl = window.location.origin + window.location.pathname + '?fbclid=teste123456789&utm_source=facebook&utm_medium=cpc&utm_campaign=teste';
    window.open(testUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste do Otimizador de Tracking Facebook</h1>
        <p className="text-muted-foreground">
          Valide e teste todos os parâmetros críticos para o Facebook Ads
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Atual</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnóstico</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Status dos Parâmetros</CardTitle>
              <CardDescription>
                Validação rápida dos parâmetros críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${validation.fbc ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                      <div className="text-sm font-medium">fbc</div>
                      <div className="text-lg">
                        {validation.fbc ? '✅' : '❌'}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${validation.fbp ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                      <div className="text-sm font-medium">fbp</div>
                      <div className="text-lg">
                        {validation.fbp ? '✅' : '❌'}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${validation.external_id ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
                      <div className="text-sm font-medium">external_id</div>
                      <div className="text-lg">
                        {validation.external_id ? '✅' : '⚠️'}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${validation.readyForConversion ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                      <div className="text-sm font-medium">Pronto para Conversões</div>
                      <div className="text-lg">
                        {validation.readyForConversion ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                  
                  <Alert className={validation.readyForConversion ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertDescription>
                      {validation.readyForConversion 
                        ? '🎉 Excelente! Todos os parâmetros críticos estão configurados para máxima correspondência de conversões.'
                        : '⚠️ Alguns parâmetros críticos estão ausentes. Execute os testes para corrigir.'}
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleQuickValidation} variant="outline" className="w-full">
                    🔄 Atualizar Status
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Verificando status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Diagnóstico Completo</CardTitle>
              <CardDescription>
                Análise detalhada de todos os parâmetros de tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleRunDiagnostic} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '⏳ Executando diagnóstico...' : '🔍 Executar Diagnóstico Completo'}
                </Button>

                {diagnostic && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{diagnostic.overallScore}/100</div>
                          <div className="text-sm text-muted-foreground">Pontuação Geral</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{diagnostic.summary.success}</div>
                          <div className="text-sm text-muted-foreground">✅ Sucessos</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">{diagnostic.summary.error}</div>
                          <div className="text-sm text-muted-foreground">❌ Erros</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      {diagnostic.parameters.map((param: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{param.parameter}</span>
                              <Badge variant={param.status === 'success' ? 'default' : param.status === 'warning' ? 'secondary' : 'destructive'}>
                                {param.score}/100
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{param.message}</p>
                            {param.value && (
                              <p className="text-xs font-mono bg-muted p-2 rounded">{param.value}</p>
                            )}
                            {param.recommendations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Recomendações:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {param.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Testes de Parâmetros</CardTitle>
                <CardDescription>
                  Teste individualmente cada componente do tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestFbclidCapture} variant="outline" className="w-full">
                  🎯 Testar Captura de fbclid
                </Button>
                <Button onClick={handleTestExternalId} variant="outline" className="w-full">
                  🆔 Testar Geração de external_id
                </Button>
                <Button onClick={handleTestCheckout} variant="outline" className="w-full">
                  🛒 Testar Evento de Checkout
                </Button>
                <Button onClick={handleCheckStatus} variant="outline" className="w-full">
                  📊 Verificar Status Completo
                </Button>
                <Button onClick={testFbclidUrl} variant="outline" className="w-full">
                  🔗 Testar com fbclid na URL
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📝 Dados de Teste</CardTitle>
                <CardDescription>
                  Configure dados para testar geração de external_id
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testData.email}
                    onChange={(e) => setTestData({...testData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={testData.phone}
                    onChange={(e) => setTestData({...testData, phone: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={testData.firstName}
                      onChange={(e) => setTestData({...testData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={testData.lastName}
                      onChange={(e) => setTestData({...testData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleTestExternalId} className="w-full">
                  🧪 Gerar external_id com estes dados
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Relatório Detalhado</CardTitle>
              <CardDescription>
                Informações completas para debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleGenerateReport} className="w-full">
                  📋 Gerar Relatório Completo
                </Button>
                
                {report && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Relatório gerado em {new Date().toLocaleString('pt-BR')}
                      </AlertDescription>
                    </Alert>
                    <Textarea
                      value={report}
                      readOnly
                      className="min-h-[400px] font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📖 Guia de Otimização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🎯 Parâmetros Críticos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>fbc</strong>: +100% conversões correspondidas</li>
                <li>• <strong>external_id</strong>: +3% conversões correspondidas</li>
                <li>• <strong>IP + User Agent</strong>: +17% conversões correspondidas</li>
                <li>• <strong>fbp</strong>: Essencial para atribuição</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Como Testar</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use a URL com ?fbclid=teste123</li>
                <li>• Preencha dados do formulário</li>
                <li>• Execute diagnóstico completo</li>
                <li>• Verifique pontuação ≥ 70/100</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}