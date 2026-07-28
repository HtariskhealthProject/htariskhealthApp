import type { BPCategory, ClassificationResult, AlarmSymptom } from '../types';

interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  riskLevel: ClassificationResult['riskLevel'];
  alertLevel: ClassificationResult['alertLevel'];
  message: string;
  recommendation: string;
}

const CATEGORY_CONFIG: Record<BPCategory, CategoryConfig> = {
  normal: {
    label: 'Normal',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    riskLevel: 'low',
    alertLevel: 'info',
    message: 'Presion arterial dentro del rango normal.',
    recommendation: 'Mantener estilo de vida saludable. Control anual.',
  },
  elevated: {
    label: 'Elevada',
    color: '#ca8a04',
    bgColor: '#fefce8',
    borderColor: '#fde68a',
    riskLevel: 'moderate',
    alertLevel: 'warning',
    message: 'Presion arterial elevada. Riesgo de progresion a HTA.',
    recommendation: 'Modificaciones en estilo de vida. Control en 3-6 meses.',
  },
  hta_stage1: {
    label: 'HTA Etapa 1',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    riskLevel: 'high',
    alertLevel: 'danger',
    message: 'Hipertension arterial Etapa 1. Requiere manejo clinico.',
    recommendation: 'Tratamiento no farmacologico + evaluacion farmacologica. Control en 1 mes.',
  },
  hta_stage2: {
    label: 'HTA Etapa 2',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    riskLevel: 'very_high',
    alertLevel: 'danger',
    message: 'Hipertension arterial Etapa 2. Riesgo cardiovascular alto.',
    recommendation: 'Inicio de farmacoterapia dual. Control en 2-4 semanas.',
  },
  hta_grave: {
    label: 'HTA Grave',
    color: '#991b1b',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    riskLevel: 'critical',
    alertLevel: 'critical',
    message: 'Crisis hipertensiva urgente. PA muy elevada sin dano organico agudo.',
    recommendation: 'Reduccion gradual en 24-48h con via oral. Hospitalizacion si es necesario.',
  },
  hypertensive_crisis: {
    label: 'Emergencia Hipertensiva',
    color: '#7f1d1d',
    bgColor: '#450a0a',
    borderColor: '#b91c1c',
    riskLevel: 'critical',
    alertLevel: 'critical',
    message: 'EMERGENCIA HIPERTENSIVA. Dano organico agudo en curso.',
    recommendation: 'Reduccion inmediata IV en UCI. Objetivo: 25% en primera hora. Evaluacion urgente.',
  },
};

interface HeartRateConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  message: string;
}

export type HeartRateCategory =
  | 'bradycardia'
  | 'normal'
  | 'tachycardia';

export function classifyHeartRate(heartRate: number): HeartRateCategory {
  if (heartRate < 60) {
    return 'bradycardia';
  }

  if (heartRate > 100) {
    return 'tachycardia';
  }

  return 'normal';
}

export const HEART_RATE_CONFIG: Record<HeartRateCategory, HeartRateConfig> = {
  bradycardia: {
  label: 'Bradicardia',
  color: '#2563eb',
  bgColor: '#eff6ff',
  borderColor: '#bfdbfe',
  message: 'Frecuencia cardíaca menor de 60 lpm.',
},

  normal: {
  label: 'Normocardia',
  color: '#16a34a',
  bgColor: '#f0fdf4',
  borderColor: '#bbf7d0',
  message: 'Frecuencia cardíaca dentro del rango normal (60-100 lpm).',
},

tachycardia: {
  label: 'Taquicardia',
  color: '#dc2626',
  bgColor: '#fef2f2',
  borderColor: '#fecaca',
  message: 'Frecuencia cardíaca mayor de 100 lpm.',
},
};

export function classifyBloodPressure(
  systolic: number,
  diastolic: number,
  symptoms: AlarmSymptom[] = []
): ClassificationResult {
  let category: BPCategory;

  if (systolic >= 180 || diastolic >= 120) {
    const hasAlarmSymptoms = symptoms.length > 0;
    category = hasAlarmSymptoms ? 'hypertensive_crisis' : 'hta_grave';
  } else if (systolic >= 140 || diastolic >= 90) {
    category = 'hta_stage2';
  } else if (systolic >= 130 || diastolic >= 80) {
    category = 'hta_stage1';
  } else if (systolic >= 120 && diastolic < 80) {
    category = 'elevated';
  } else {
    category = 'normal';
  }

  const config = CATEGORY_CONFIG[category];

  return {
    category,
    riskLevel: config.riskLevel,
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.borderColor,
    alertLevel: config.alertLevel,
    message: config.message,
    recommendation: config.recommendation,
  };
}

export function calculateMeanArterialPressure(systolic: number, diastolic: number): number {
  return Math.round(((systolic + 2 * diastolic) / 3) * 10) / 10;
}

export function calculateBMI(weightKg: number, heightM: number): number {
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export const DISCLAIMER = 'Este sistema es una herramienta de apoyo clinico y NO reemplaza el criterio medico profesional. Las clasificaciones se basan en las guias AHA/ACC 2025. Siempre confirme los resultados con evaluacion clinica completa.';


