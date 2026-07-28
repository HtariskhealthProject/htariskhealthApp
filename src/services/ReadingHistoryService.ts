import type { BloodPressureReading, BloodPressureReadingFormData, PatientTrendPoint } from '../types';
import { supabase } from '../lib/supabase';
import { mockReadings, mockPatients } from '../data/mockData';
import { BloodPressureClassificationService } from './BloodPressureClassificationService';
import { PatientService } from './PatientService';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
let readings = [...mockReadings];

function dbToReading(row: Record<string, unknown>): BloodPressureReading {
  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    user_id: (row.professional_id as string) || '',
    systolic: row.systolic as number,
    diastolic: row.diastolic as number,
    heart_rate: (row.heart_rate as number) || 0,
    mean_arterial_pressure: Number(row.mean_arterial_pressure) || 0,
    reading_context: (row.context as BloodPressureReading['reading_context']) || 'consultation',
    reading_method: (row.method as BloodPressureReading['reading_method']) || 'automatic',
    arm: 'left',
    position: 'sitting',
    alarm_symptoms: Array.isArray(row.symptoms) ? row.symptoms as BloodPressureReading['alarm_symptoms'] : [],
    category: (row.category as BloodPressureReading['category']) || 'normal',
    risk_level: (row.risk_level as BloodPressureReading['risk_level']) || 'low',
    notes: (row.notes as string) || '',
    created_at: (row.created_at as string) || '',
  };
}

function readingToDb(formData: BloodPressureReadingFormData, userId: string) {
  const enriched = BloodPressureClassificationService.classifyAndEnrich(formData, userId);
  return {
    patient_id: formData.patient_id,
    professional_id: userId,
    systolic: formData.systolic,
    diastolic: formData.diastolic,
    heart_rate: formData.heart_rate || null,
    mean_arterial_pressure: enriched.mean_arterial_pressure,
    context: formData.reading_context,
    method: formData.reading_method,
    symptoms: formData.alarm_symptoms,
    category: enriched.category,
    risk_level: enriched.risk_level,
    recommendation: enriched.category,
    notes: formData.notes || '',
  };
}

export const ReadingHistoryService = {
  async getAll(): Promise<BloodPressureReading[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(dbToReading);
    }
    await new Promise((r) => setTimeout(r, 200));
    return [...readings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getByPatient(patientId: string): Promise<BloodPressureReading[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(dbToReading);
    }
    await new Promise((r) => setTimeout(r, 150));
    return readings
      .filter((r) => r.patient_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async create(formData: BloodPressureReadingFormData, userId: string): Promise<BloodPressureReading> {
    if (USE_SUPABASE) {
      const row = readingToDb(formData, userId);
      const { data: inserted, error } = await supabase
        .from('blood_pressure_readings')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return dbToReading(inserted);
    }
    await new Promise((r) => setTimeout(r, 300));
    const enriched = BloodPressureClassificationService.classifyAndEnrich(formData, userId);
    const reading: BloodPressureReading = {
      id: `r${Date.now()}`,
      ...enriched,
      created_at: new Date().toISOString(),
    };
    readings.push(reading);
    return reading;
  },

  async getRecent(limit: number = 10): Promise<BloodPressureReading[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(dbToReading);
    }
    await new Promise((r) => setTimeout(r, 100));
    return [...readings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  async getCritical(): Promise<BloodPressureReading[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .in('category', ['hta_grave', 'hypertensive_crisis'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(dbToReading);
    }
    await new Promise((r) => setTimeout(r, 100));
    return readings.filter(
      (r) => r.category === 'hta_grave' || r.category === 'hypertensive_crisis'
    );
  },

  async count(): Promise<number> {
    if (USE_SUPABASE) {
      const { count, error } = await supabase
        .from('blood_pressure_readings')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    }
    return readings.length;
  },

  async getPatientTrend(patientId: string): Promise<PatientTrendPoint[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const allReadings = (data ?? []).map(dbToReading);
      if (allReadings.length === 0) return [];

      const patient = await PatientService.getById(patientId);
      const bmi = patient ? patient.bmi : 0;

      return allReadings.map((r) => ({
        date: r.created_at.slice(0, 10),
        systolic: r.systolic,
        diastolic: r.diastolic,
        heartRate: r.heart_rate,
        bmi,
      }));
    }
    await new Promise((r) => setTimeout(r, 150));
    const patientReadings = readings
      .filter((r) => r.patient_id === patientId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (patientReadings.length === 0) return [];

    const patient = mockPatients.find((p) => p.id === patientId);
    const bmi = patient ? patient.bmi : 0;

    return patientReadings.map((r) => ({
      date: r.created_at.slice(0, 10),
      systolic: r.systolic,
      diastolic: r.diastolic,
      heartRate: r.heart_rate,
      bmi,
    }));
  },

  async filter(filters: {
    patientId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<BloodPressureReading[]> {
    if (USE_SUPABASE) {
      let query = supabase
        .from('blood_pressure_readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(dbToReading);
    }
    await new Promise((r) => setTimeout(r, 150));
    let result = [...readings];
    if (filters.patientId) result = result.filter((r) => r.patient_id === filters.patientId);
    if (filters.category) result = result.filter((r) => r.category === filters.category);
    if (filters.dateFrom)
      result = result.filter((r) => new Date(r.created_at) >= new Date(filters.dateFrom!));
    if (filters.dateTo)
      result = result.filter((r) => new Date(r.created_at) <= new Date(filters.dateTo!));
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
};
