import { CnpjDocument } from './documents/cnpj.document';
import { CpfDocument } from './documents/cpf.document';

export const sanitizeDocument = (document: string): string =>
  document.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export const isCpf = (document: string): boolean =>
  /^\d{11}$/.test(sanitizeDocument(document));

export const isCnpj = (document: string): boolean =>
  /^[A-Z0-9]{14}$/.test(sanitizeDocument(document));

export const isValidCpf = (document: string): boolean =>
  new CpfDocument(document).isValid();

export const isValidCnpj = (document: string): boolean =>
  new CnpjDocument(document).isValid();

export const isValidCpfOrCnpj = (document: string): boolean => {
  if (isCpf(document)) {
    return isValidCpf(document);
  }

  if (isCnpj(document)) {
    return isValidCnpj(document);
  }

  return false;
};
