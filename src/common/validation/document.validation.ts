import { CnpjDocument } from './documents/cnpj.document';
import { CpfDocument } from './documents/cpf.document';

export const sanitizeDocument = (document: string): string =>
  document.replace(/\D/g, '');

export const isCpf = (document: string): boolean =>
  sanitizeDocument(document).length === 11;

export const isCnpj = (document: string): boolean =>
  sanitizeDocument(document).length === 14;

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
