export type DocumentType = 'CC' | 'TI' | 'CE' | 'PA' | 'RC';
export type Sex = 'M' | 'F' | 'O';
export type ReadingContext = 'consultation' | 'home' | 'emergency' | 'pharmacy' | 'workplace';
export type ReadingMethod = 'manual' | 'automatic' | 'mercury' | 'aneroide';
export type AlarmSymptom = 'headache' | 'blurred_vision' | 'chest_pain' | 'dyspnea' | 'neurological_deficit' | 'epistaxis' | 'tinnitus' | 'nausea_vomiting';
export type BPCategory = 'normal' | 'elevated' | 'hta_stage1' | 'hta_stage2' | 'hta_grave' | 'hypertensive_crisis';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'critical';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'medico' | 'enfermero';
  license_number: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string;
  first_name: string;
  last_name: string;
  sex: Sex;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  eps: string;
  weight_kg: number;
  height_m: number;
  bmi: number;
  comorbidities: string[];
  medications: string[];
  family_history: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PatientFormData {
  document_type: DocumentType;
  document_number: string;
  first_name: string;
  last_name: string;
  sex: Sex;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  eps: string;
  weight_kg: number;
  height_m: number;
  comorbidities: string[];
  medications: string[];
  family_history: string[];
  notes: string;
}

export interface BloodPressureReading {
  id: string;
  patient_id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  mean_arterial_pressure: number;
  reading_context: ReadingContext;
  reading_method: ReadingMethod;
  arm: 'left' | 'right';
  position: 'sitting' | 'standing' | 'lying';
  alarm_symptoms: AlarmSymptom[];
  category: BPCategory;
  risk_level: RiskLevel;
  notes: string;
  created_at: string;
}

export interface BloodPressureReadingFormData {
  patient_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  reading_context: ReadingContext;
  reading_method: ReadingMethod;
  arm: 'left' | 'right';
  position: 'sitting' | 'standing' | 'lying';
  alarm_symptoms: AlarmSymptom[];
  notes: string;
}

export interface ClassificationResult {
  category: BPCategory;
  riskLevel: RiskLevel;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  alertLevel: 'info' | 'warning' | 'danger' | 'critical';
  message: string;
  recommendation: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalReadings: number;
  criticalReadings: number;
  averageSystolic: number;
  averageDiastolic: number;
  categoryBreakdown: Record<BPCategory, number>;
}

export const ALARM_SYMPTOMS: Record<AlarmSymptom, string> = {
  headache: 'Cefalea severa',
  blurred_vision: 'Vision borrosa',
  chest_pain: 'Dolor toracico',
  dyspnea: 'Disnea',
  neurological_deficit: 'Deficit neurologico',
  epistaxis: 'Epistaxis',
  tinnitus: 'Tinnitus / Acufenos',
  nausea_vomiting: 'Nauseas / Vomito',
};

export const BP_CATEGORY_LABELS: Record<BPCategory, string> = {
  normal: 'Normal',
  elevated: 'Elevada',
  hta_stage1: 'HTA Etapa 1',
  hta_stage2: 'HTA Etapa 2',
  hta_grave: 'HTA Grave',
  hypertensive_crisis: 'Emergencia Hipertensiva',
};
