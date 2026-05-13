/**
 * StorageService - Almacenamiento de evidencias clinicas
 *
 * Permite subir, descargar y gestionar archivos adjuntos
 * (evidencias, soportes documentales) usando Supabase Storage.
 *
 * Bucket sugerido: clinical-evidence
 * - Archivos de soporte de mediciones
 * - Documentos clinicos del paciente
 * - Evidencias fotograficas
 *
 * Uso:
 *   const url = await StorageService.upload(file, patientId);
 *   const files = await StorageService.list(patientId);
 *   await StorageService.remove(path);
 *
 * Supabase Storage usa buckets con politicas de acceso.
 * Las URLs firmadas permiten acceso temporal a archivos privados.
 */
import { supabase } from '../lib/supabase';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const BUCKET = 'clinical-evidence';

export const StorageService = {
  async upload(file: File, patientId: string): Promise<string> {
    if (!USE_SUPABASE) {
      console.warn('StorageService: Supabase not configured. File upload skipped.');
      return '';
    }

    const ext = file.name.split('.').pop();
    const path = `${patientId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async list(patientId: string): Promise<{ name: string; url: string }[]> {
    if (!USE_SUPABASE) return [];

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(patientId);

    if (error) {
      console.error('Storage list error:', error);
      return [];
    }

    return (data ?? []).map((file) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${patientId}/${file.name}`);
      return { name: file.name, url: urlData.publicUrl };
    });
  },

  async remove(path: string): Promise<void> {
    if (!USE_SUPABASE) return;

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  },

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (!USE_SUPABASE) return '';

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Storage signed URL error:', error);
      return '';
    }

    return data?.signedUrl ?? '';
  },
};
