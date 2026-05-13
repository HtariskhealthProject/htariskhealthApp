import type { Patient, PatientFormData } from '../types';
import { supabase } from '../lib/supabase';
import { mockPatients } from '../data/mockData';
import { calculateBMI } from '../utils/classification';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
let patients = [...mockPatients];

function dbToPatient(row: Record<string, unknown>): Patient {
  const fullName = (row.full_name as string) || '';
  const parts = fullName.split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  return {
    id: row.id as string,
    user_id: (row.created_by as string) || '',
    document_type: (row.document_type as Patient['document_type']) || 'CC',
    document_number: (row.document_number as string) || '',
    first_name: firstName,
    last_name: lastName,
    sex: (row.sex as Patient['sex']) || 'M',
    birth_date: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    eps: '',
    weight_kg: Number(row.weight) || 0,
    height_m: Number(row.height) || 0,
    bmi: Number(row.bmi) || 0,
    comorbidities: typeof row.comorbidities === 'string' ? (row.comorbidities as string).split(',').map(s => s.trim()).filter(Boolean) : [],
    medications: typeof row.medications === 'string' ? (row.medications as string).split(',').map(s => s.trim()).filter(Boolean) : [],
    family_history: [],
    notes: (row.notes as string) || '',
    created_at: (row.created_at as string) || '',
    updated_at: (row.created_at as string) || '',
  };
}

function patientToDb(data: PatientFormData, userId: string) {
  const fullName = `${data.first_name} ${data.last_name}`;
  const age = data.birth_date
    ? Math.floor((Date.now() - new Date(data.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  return {
    full_name: fullName,
    document_type: data.document_type,
    document_number: data.document_number,
    age: age > 0 ? age : 30,
    sex: data.sex,
    weight: data.weight_kg || null,
    height: data.height_m || null,
    bmi: calculateBMI(data.weight_kg, data.height_m) || null,
    comorbidities: data.comorbidities.join(', '),
    medications: data.medications.join(', '),
    notes: data.notes || '',
    created_by: userId,
  };
}

export const PatientService = {
  async getAll(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(dbToPatient);
    }
    await new Promise((r) => setTimeout(r, 200));
    return [...patients];
  },

  async getById(id: string): Promise<Patient | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? dbToPatient(data) : null;
    }
    await new Promise((r) => setTimeout(r, 100));
    return patients.find((p) => p.id === id) ?? null;
  },

  async search(query: string): Promise<Patient[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${query}%,document_number.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(dbToPatient);
    }
    await new Promise((r) => setTimeout(r, 150));
    const q = query.toLowerCase();
    return patients.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        p.document_number.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  },

  async create(data: PatientFormData, userId: string): Promise<Patient> {
    if (USE_SUPABASE) {
      const row = patientToDb(data, userId);
      const { data: inserted, error } = await supabase.from('patients').insert(row).select().single();
      if (error) throw error;
      return dbToPatient(inserted);
    }
    await new Promise((r) => setTimeout(r, 300));
    const patient: Patient = {
      id: `p${Date.now()}`,
      user_id: userId,
      ...data,
      bmi: calculateBMI(data.weight_kg, data.height_m),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    patients.push(patient);
    return patient;
  },

  async update(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    if (USE_SUPABASE) {
      const updateData: Record<string, unknown> = {};
      if (data.first_name || data.last_name) {
        const existing = await this.getById(id);
        const firstName = data.first_name ?? existing?.first_name ?? '';
        const lastName = data.last_name ?? existing?.last_name ?? '';
        updateData.full_name = `${firstName} ${lastName}`;
      }
      if (data.document_type) updateData.document_type = data.document_type;
      if (data.document_number) updateData.document_number = data.document_number;
      if (data.sex) updateData.sex = data.sex;
      if (data.weight_kg) updateData.weight = data.weight_kg;
      if (data.height_m) updateData.height = data.height_m;
      if (data.weight_kg && data.height_m) updateData.bmi = calculateBMI(data.weight_kg, data.height_m);
      if (data.comorbidities) updateData.comorbidities = data.comorbidities.join(', ');
      if (data.medications) updateData.medications = data.medications.join(', ');
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: updated, error } = await supabase.from('patients').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return dbToPatient(updated);
    }
    await new Promise((r) => setTimeout(r, 300));
    const idx = patients.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Paciente no encontrado');
    patients[idx] = {
      ...patients[idx],
      ...data,
      bmi:
        data.weight_kg && data.height_m
          ? calculateBMI(data.weight_kg, data.height_m)
          : patients[idx].bmi,
      updated_at: new Date().toISOString(),
    };
    return patients[idx];
  },

  async delete(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    await new Promise((r) => setTimeout(r, 200));
    patients = patients.filter((p) => p.id !== id);
  },

  async count(): Promise<number> {
    if (USE_SUPABASE) {
      const { count, error } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    }
    return patients.length;
  },
};
