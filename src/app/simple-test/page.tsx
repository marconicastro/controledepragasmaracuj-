'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SimpleFormTest() {
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário enviado!');
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    console.log('Dados do formulário:', data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Formulário Simples</h1>
        <Button onClick={() => setIsOpen(true)}>Abrir Formulário</Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Formulário de Teste</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="test-name">Nome</Label>
                <Input
                  id="test-name"
                  name="test-name"
                  type="text"
                  placeholder="Digite seu nome"
                  autoComplete="name"
                />
              </div>
              
              <div>
                <Label htmlFor="test-email">Email</Label>
                <Input
                  id="test-email"
                  name="test-email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              
              <div>
                <Label htmlFor="test-phone">Telefone</Label>
                <Input
                  id="test-phone"
                  name="test-phone"
                  type="tel"
                  placeholder="(11) 99999-8888"
                  autoComplete="tel"
                />
              </div>
              
              <Button type="submit">Enviar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}