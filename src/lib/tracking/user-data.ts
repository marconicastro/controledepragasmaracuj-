/**
 * Gerenciamento de dados do usuário para tracking
 * Captura, validação e armazenamento de informações do usuário
 */

import { UserData } from './gtm';
import { getCookie } from '../cookies';

export interface PersonalData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FormFieldData {
  value: string;
  isValid: boolean;
  sanitized: string;
}

/**
 * Classe para gerenciar dados do usuário
 */
export class UserDataManager {
  private static readonly STORAGE_KEYS = {
    PERSONAL_DATA: 'user_personal_data',
    EMAIL: 'user_email',
    PHONE: 'user_phone',
    LOCATION: 'user_location'
  };

  /**
   * Valida e sanitiza email
   */
  static validateEmail(email: string): FormFieldData {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    const sanitized = email.toLowerCase().trim();
    
    return {
      value: email,
      isValid,
      sanitized
    };
  }

  /**
   * Valida e sanitiza telefone
   */
  static validatePhone(phone: string): FormFieldData {
    // Remover todos os caracteres não numéricos
    const sanitized = phone.replace(/\D/g, '');
    
    // Validar formato brasileiro (10 ou 11 dígitos)
    const isValid = sanitized.length >= 10 && sanitized.length <= 11;
    
    return {
      value: phone,
      isValid,
      sanitized
    };
  }

  /**
   * Valida e sanitiza nome
   */
  static validateName(name: string, type: 'first' | 'last' = 'first'): FormFieldData {
    // Remover caracteres especiais, manter apenas letras, espaços e hífens
    const sanitized = name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/^'+|'+$/g, '');
    
    const isValid = sanitized.length > 0;
    
    return {
      value: name,
      isValid,
      sanitized
    };
  }

  /**
   * Valida e sanitiza CEP
   */
  static validateZip(zip: string): FormFieldData {
    const sanitized = zip.replace(/\D/g, '');
    const isValid = sanitized.length === 8;
    
    return {
      value: zip,
      isValid,
      sanitized
    };
  }

  /**
   * Valida e sanitiza cidade
   */
  static validateCity(city: string): FormFieldData {
    const sanitized = city
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
    
    const isValid = sanitized.length > 0;
    
    return {
      value: city,
      isValid,
      sanitized
    };
  }

  /**
   * Valida e sanitiza estado
   */
  static validateState(state: string): FormFieldData {
    const sanitized = state
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    
    const isValid = sanitized.length === 2;
    
    return {
      value: state,
      isValid,
      sanitized
    };
  }

  /**
   * Formata nome completo em first_name e last_name
   */
  static splitFullName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    
    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: ''
      };
    }
    
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    
    return { firstName, lastName };
  }

  /**
   * Salva dados pessoais no localStorage
   */
  static savePersonalData(data: PersonalData): void {
    if (typeof window === 'undefined') return;

    try {
      // Salvar dados completos
      localStorage.setItem(
        this.STORAGE_KEYS.PERSONAL_DATA, 
        JSON.stringify(data)
      );

      // Salvar individualmente para acesso rápido
      if (data.email) {
        localStorage.setItem(this.STORAGE_KEYS.EMAIL, data.email);
      }
      
      if (data.phone) {
        localStorage.setItem(this.STORAGE_KEYS.PHONE, data.phone);
      }

      // Salvar dados de localização
      const locationData = {
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country || 'BR'
      };
      
      localStorage.setItem(
        this.STORAGE_KEYS.LOCATION, 
        JSON.stringify(locationData)
      );

      console.log('💾 Dados pessoais salvos:', this.sanitizeForLogging(data));
    } catch (error) {
      console.error('❌ Erro ao salvar dados pessoais:', error);
    }
  }

  /**
   * Carrega dados pessoais do localStorage
   */
  static loadPersonalData(): PersonalData {
    if (typeof window === 'undefined') return {};

    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.PERSONAL_DATA);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados pessoais:', error);
    }

    return {};
  }

  /**
   * Carrega dados de localização
   */
  static loadLocationData(): {
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } {
    if (typeof window === 'undefined') return {};

    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.LOCATION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de localização:', error);
    }

    return {};
  }

  /**
   * Obtém dados do usuário formatados para o GTM
   */
  static getFormattedUserData(): UserData {
    const personalData = this.loadPersonalData();
    const locationData = this.loadLocationData();

    return {
      em: personalData.email,
      ph: personalData.phone,
      fn: personalData.firstName,
      ln: personalData.lastName,
      ct: locationData.city,
      st: locationData.state,
      zp: locationData.zip,
      country: locationData.country || 'BR'
    };
  }

  /**
   * Processa dados de formulário e salva
   */
  static processFormData(formData: {
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    zip?: string;
  }): { isValid: boolean; userData: UserData; errors: string[] } {
    const errors: string[] = [];
    const userData: UserData = {};

    // Processar nome completo
    if (formData.fullName) {
      const nameParts = this.splitFullName(formData.fullName);
      
      const firstNameValidation = this.validateName(nameParts.firstName);
      const lastNameValidation = this.validateName(nameParts.lastName);
      
      if (firstNameValidation.isValid) {
        userData.fn = firstNameValidation.sanitized;
      } else {
        errors.push('Nome inválido');
      }
      
      if (lastNameValidation.isValid) {
        userData.ln = lastNameValidation.sanitized;
      }
    }

    // Processar email
    if (formData.email) {
      const emailValidation = this.validateEmail(formData.email);
      if (emailValidation.isValid) {
        userData.em = emailValidation.sanitized;
      } else {
        errors.push('Email inválido');
      }
    }

    // Processar telefone
    if (formData.phone) {
      const phoneValidation = this.validatePhone(formData.phone);
      if (phoneValidation.isValid) {
        userData.ph = phoneValidation.sanitized;
      } else {
        errors.push('Telefone inválido');
      }
    }

    // Processar cidade
    if (formData.city) {
      const cityValidation = this.validateCity(formData.city);
      if (cityValidation.isValid) {
        userData.ct = cityValidation.sanitized;
      } else {
        errors.push('Cidade inválida');
      }
    }

    // Processar estado
    if (formData.state) {
      const stateValidation = this.validateState(formData.state);
      if (stateValidation.isValid) {
        userData.st = stateValidation.sanitized;
      } else {
        errors.push('Estado inválido');
      }
    }

    // Processar CEP
    if (formData.zip) {
      const zipValidation = this.validateZip(formData.zip);
      if (zipValidation.isValid) {
        userData.zp = zipValidation.sanitized;
      } else {
        errors.push('CEP inválido');
      }
    }

    // Definir país padrão
    userData.country = 'BR';

    // Salvar dados se válidos
    if (errors.length === 0) {
      this.savePersonalData({
        email: userData.em,
        phone: userData.ph,
        firstName: userData.fn,
        lastName: userData.ln,
        city: userData.ct,
        state: userData.st,
        zip: userData.zp,
        country: userData.country
      });
    }

    return {
      isValid: errors.length === 0,
      userData,
      errors
    };
  }

  /**
   * Limpa dados sensíveis para logging
   */
  private static sanitizeForLogging(data: PersonalData): any {
    const sanitized = { ...data };
    
    if (sanitized.email) {
      sanitized.email = '[REDACTED]';
    }
    
    if (sanitized.phone) {
      sanitized.phone = '[REDACTED]';
    }
    
    return sanitized;
  }

  /**
   * Limpa todos os dados do usuário
   */
  static clearUserData(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🗑️ Dados do usuário limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados do usuário:', error);
    }
  }
}

export default UserDataManager;