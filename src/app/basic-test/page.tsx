'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BasicFormTest() {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(`📝 Campo ${name} alterado para:`, value);
    console.log(`📝 Elemento do campo ${name}:`, e.target);
    console.log(`📝 Atributos do campo ${name}:`, {
      id: e.target.id,
      name: e.target.name,
      type: e.target.type,
      autoComplete: e.target.getAttribute('autocomplete')
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Formulário enviado!');
    console.log('📊 Dados do formulário:', formData);
    
    // Verificar todos os campos do formulário
    const form = e.target as HTMLFormElement;
    const inputs = form.querySelectorAll('input');
    console.log('🔍 Todos os inputs encontrados:', inputs.length);
    
    inputs.forEach((input, index) => {
      console.log(`📝 Input ${index + 1}:`, {
        id: input.id,
        name: input.name,
        type: input.type,
        value: input.value,
        hasId: !!input.id,
        hasName: !!input.name,
        autoComplete: input.getAttribute('autocomplete')
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Formulário Básico</h1>
        <Button onClick={() => setIsOpen(true)}>Abrir Formulário</Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Formulário Básico de Teste</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="basic-fullName">Nome Completo</Label>
                <Input
                  id="basic-fullName"
                  name="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="basic-email">Email</Label>
                <Input
                  id="basic-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="basic-phone">Telefone</Label>
                <Input
                  id="basic-phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-8888"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <Button type="submit">Enviar Formulário</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}