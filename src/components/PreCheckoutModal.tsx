'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CreditCard, User, Mail, Phone, MapPin, Building, Map } from 'lucide-react';

// Schema de validação do formulário
const checkoutFormSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .refine(
      (value) => {
        // Permitir letras, espaços e caracteres comuns em nomes
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim());
      },
      'Nome deve conter apenas letras, espaços, apóstrofos e hífens'
    ),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone deve ter formato completo (XX) XXXXX-XXXX')
    .refine(
      (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
      },
      'Telefone deve ter 10 ou 11 dígitos'
    ),
  cep: z.string().min(9, 'CEP inválido'),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().min(2, 'UF deve ter 2 caracteres').max(2, 'UF deve ter 2 caracteres'),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface PreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutFormData) => void;
}

export default function PreCheckoutModal({ isOpen, onClose, onSubmit }: PreCheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: 'onChange', // Adicionar validação em tempo real
  });

  // Log para depuração quando o componente montar
  React.useEffect(() => {
    console.log('📝 PreCheckoutModal - Componente montado');
    console.log('📝 PreCheckoutModal - Função register disponível:', typeof register);
  }, []);

  // Função para formatar telefone - MELHORADA
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos (celular com 9) ou 10 dígitos (fixo)
    if (cleaned.length === 0) {
      return value;
    }
    
    // Limitar a 11 dígitos no máximo
    const limitedCleaned = cleaned.substring(0, 11);
    
    if (limitedCleaned.length <= 2) {
      return `(${limitedCleaned}`;
    } else if (limitedCleaned.length <= 6) {
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2);
      return `(${ddd}) ${firstPart}`;
    } else if (limitedCleaned.length <= 10) {
      // Formato fixo: (11) 9999-8888
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2, 6);
      const secondPart = limitedCleaned.substring(6);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    } else {
      // Formato celular: (77) 99827-606 (formato brasileiro padrão)
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2, 7);
      const secondPart = limitedCleaned.substring(7);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    }
  };

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  // Função para formatar UF (somente letras e maiúsculas)
  const formatUF = (value: string) => {
    return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
  };

  // Handlers para formatação em tempo real
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue('cep', formatted);
  };

  const handleUFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUF(e.target.value);
    setValue('state', formatted);
  };

  // Função para buscar endereço pelo CEP
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('city', data.localidade || '');
          setValue('state', data.uf || '');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const onCEPBlur = () => {
    const cepValue = watch('cep');
    if (cepValue) {
      fetchAddressByCEP(cepValue);
    }
  };

  const onFormSubmit = async (data: CheckoutFormData) => {
    console.log('📤 PreCheckoutModal - onFormSubmit chamado!');
    console.log('📤 PreCheckoutModal - Dados recebidos do formulário:');
    console.log('   fullName:', data.fullName);
    console.log('   email:', data.email);
    console.log('   phone:', data.phone);
    console.log('   cep:', data.cep);
    console.log('   city:', data.city);
    console.log('   state:', data.state);
    console.log('📤 PreCheckoutModal - Enviando dados para o pai...');
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      console.log('✅ PreCheckoutModal - Envio concluído com sucesso');
      reset();
    } catch (error) {
      console.error('❌ Erro ao enviar formulário:', error);
      // Adicionar feedback visual para o usuário
      alert('Erro ao processar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adicionar log para ver se o formulário está sendo submetido
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('📤 PreCheckoutModal - Formulário sendo submetido manualmente!');
    console.log('📤 PreCheckoutModal - Evento:', e);
    
    // Verificar todos os campos do formulário antes de submeter
    const form = e.target as HTMLFormElement;
    const inputs = form.querySelectorAll('input');
    console.log('🔍 PreCheckoutModal - Todos os inputs encontrados:', inputs.length);
    
    inputs.forEach((input, index) => {
      console.log(`📝 PreCheckoutModal - Input ${index + 1}:`, {
        id: input.id,
        name: input.name,
        type: input.type,
        value: input.value,
        hasId: !!input.id,
        hasName: !!input.name,
        autoComplete: input.getAttribute('autocomplete')
      });
    });
    
    handleSubmit(onFormSubmit)(e);
  };

  // Resetar formulário quando o modal fechar
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Shield className="w-6 h-6 text-green-600" />
            Finalize sua compra com segurança
          </DialogTitle>
          <DialogDescription className="text-base">
            Preencha seus dados para acessar o pagamento seguro e pré-preenchido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Campo Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Digite seu nome completo"
              autoComplete="name"
              {...register('fullName', { required: true })}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Campo E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email', { required: true })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Telefone *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(77) 99827-606"
              autoComplete="tel"
              {...register('phone', { required: true })}
              onChange={handlePhoneChange}
              maxLength={15}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Campo CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              CEP *
            </Label>
            <Input
              id="cep"
              name="cep"
              placeholder="00000-000"
              autoComplete="postal-code"
              {...register('cep')}
              onChange={handleCEPChange}
              onBlur={onCEPBlur}
              maxLength={9}
              className={errors.cep ? 'border-red-500' : ''}
            />
            {errors.cep && (
              <p className="text-xs text-red-500">{errors.cep.message}</p>
            )}
          </div>

          {/* Campos de Cidade e UF */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium">
                <Building className="w-4 h-4" />
                Cidade *
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="São Paulo"
                autoComplete="address-level2"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2 text-sm font-medium">
                <Map className="w-4 h-4" />
                UF *
              </Label>
              <Input
                id="state"
                name="state"
                placeholder="SP"
                autoComplete="address-level1"
                {...register('state')}
                onChange={handleUFChange}
                maxLength={2}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Botão de Envio */}
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                IR PARA O PAGAMENTO SEGURO
              </div>
            )}
          </Button>

          {/* Selos de Segurança */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="w-3 h-3 text-green-600" />
              Pagamento Seguro
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <CreditCard className="w-3 h-3 text-blue-600" />
              Criptografia SSL
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}