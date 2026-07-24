import type { Patient, PatientFormData } from '../types';
import { supabase } from '../lib/supabase';
import { mockPatients } from '../data/mockData';
import { calculateBMI } from '../utils/classification';

const USE_SUPABASE = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let patients = [...mockPatients];

function dbToPatient(row: Record<string, any>): Patient {
  return {
    id: row.id,
    user_id: row.created_by,

    document_type: row.document_type,
    document_number: row.document_number,

    first_name: row.first_name ?? '',
    last_name: row.last_name ?? '',

    sex: row.sex,

    birth_date: row.birth_date ?? '',

    phone: row.phone ?? '',

    email: row.email ?? '',

    address: row.address ?? '',

    city: row.city ?? '',

    eps: row.eps ?? '',

    weight_kg: Number(row.weight_kg ?? 0),

    height_m: Number(row.height_m ?? 0),

    bmi:
      row.bmi ??
      calculateBMI(
        Number(row.weight_kg ?? 0),
        Number(row.height_m ?? 0)
      ),

    comorbidities: Array.isArray(row.comorbidities)
      ? row.comorbidities
      : [],

    medications: Array.isArray(row.medications)
      ? row.medications
      : [],

    family_history: Array.isArray(row.family_history)
      ? row.family_history
      : [],

    notes: row.notes ?? '',

    created_at: row.created_at,

    updated_at: row.updated_at,
  };
}

function patientToDb(
  data: PatientFormData,
  userId: string
) {
  return {
    created_by: userId,

    document_type: data.document_type,

    document_number: data.document_number,

    first_name: data.first_name,

    last_name: data.last_name,

    sex: data.sex,

    birth_date: data.birth_date || null,

    phone: data.phone,

    email: data.email,

    address: data.address,

    city: data.city,

    eps: data.eps,

    weight_kg: data.weight_kg || null,

    height_m: data.height_m || null,

    bmi:
      calculateBMI(
        data.weight_kg,
        data.height_m
      ) || null,

    comorbidities: data.comorbidities,

    medications: data.medications,

    family_history: data.family_history,

    notes: data.notes,
  };
}

export const PatientService = {  async getAll(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(dbToPatient);
    }

    await new Promise((r) => setTimeout(r, 200));

    return [...patients];
  },

  async getById(id: string): Promise<Patient | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

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
        .or(
          [
            `first_name.ilike.%${query}%`,
            `last_name.ilike.%${query}%`,
            `document_number.ilike.%${query}%`,
            `email.ilike.%${query}%`
          ].join(',')
        )
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

      const { data: inserted, error } = await supabase
        .from('patients')
        .insert(row)
        .select()
        .single();

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

  async update(
    id: string,
    data: Partial<PatientFormData>
  ): Promise<Patient> {
    if (USE_SUPABASE) {
      const existing = await this.getById(id);

      if (!existing) {
        throw new Error('Paciente no encontrado');
      }

      const merged = {
        ...existing,
        ...data,
      };

      const updateData = {
        document_type: merged.document_type,
        document_number: merged.document_number,
        first_name: merged.first_name,
        last_name: merged.last_name,
        sex: merged.sex,
        birth_date: merged.birth_date || null,
        phone: merged.phone,
        email: merged.email,
        address: merged.address,
        city: merged.city,
        eps: merged.eps,
        weight_kg: merged.weight_kg || null,
        height_m: merged.height_m || null,
        bmi:
          calculateBMI(
            merged.weight_kg,
            merged.height_m
          ) || null,
        comorbidities: merged.comorbidities,
        medications: merged.medications,
        family_history: merged.family_history,
        notes: merged.notes,
      };

      const { data: updated, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return dbToPatient(updated);
    }

    await new Promise((r) => setTimeout(r, 300));

    const idx = patients.findIndex((p) => p.id === id);

    if (idx === -1) {
      throw new Error('Paciente no encontrado');
    }

    patients[idx] = {
      ...patients[idx],
      ...data,
      bmi: calculateBMI(
        data.weight_kg ?? patients[idx].weight_kg,
        data.height_m ?? patients[idx].height_m
      ),
      updated_at: new Date().toISOString(),
    };

    return patients[idx];
  },

  async delete(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return;
    }

    await new Promise((r) => setTimeout(r, 200));

    patients = patients.filter((p) => p.id !== id);
  },

  async count(): Promise<number> {
    if (USE_SUPABASE) {
      const { count, error } = await supabase
        .from('patients')
        .select('*', {
          count: 'exact',
          head: true,
        });

      if (error) throw error;

      return count ?? 0;
    }

    return patients.length;
  },
};