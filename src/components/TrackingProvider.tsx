'use client';

import React, { useEffect } from 'react';
import { initializeTracking } from '@/lib/tracking';

interface TrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider para inicializar o sistema de tracking
 * Deve ser envolvido em volta do componente principal da aplicação
 */
export function TrackingProvider({ children }: TrackingProviderProps) {
  useEffect(() => {
    // Inicializar tracking apenas no cliente
    if (typeof window !== 'undefined') {
      console.log('🚀 Inicializando Tracking Provider...');
      
      // Pequeno delay para garantir que todos os scripts estejam carregados
      const timer = setTimeout(() => {
        try {
          initializeTracking();
          console.log('✅ Tracking Provider inicializado com sucesso!');
        } catch (error) {
          console.error('❌ Erro ao inicializar Tracking Provider:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return <>{children}</>;
}

export default TrackingProvider;