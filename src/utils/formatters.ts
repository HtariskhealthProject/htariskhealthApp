import type { DocumentType, ReadingContext, ReadingMethod, Sex } from '../types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBP(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic} mmHg`;
}

export function formatMAP(map: number): string {
  return `${map} mmHg`;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: 'Cedula de Ciudadania',
  TI: 'Tarjeta de Identidad',
  CE: 'Cedula de Extranjeria',
  PA: 'Pasaporte',
  RC: 'Registro Civil',
};

export const CONTEXT_LABELS: Record<ReadingContext, string> = {
  consultation: 'Consulta',
  home: 'Domiciliaria',
  emergency: 'Urgencias',
  pharmacy: 'Farmacia',
  workplace: 'Laboral',
};

export const METHOD_LABELS: Record<ReadingMethod, string> = {
  manual: 'Manual',
  automatic: 'Automatico',
  mercury: 'Mercurio',
  aneroide: 'Aneroide',
};

export const SEX_LABELS: Record<Sex, string> = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};
