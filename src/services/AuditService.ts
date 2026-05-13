/**
 * AuditService - Trazabilidad de acciones clinicas
 *
 * Registra todas las acciones relevantes del sistema para cumplimiento
 * de trazabilidad y auditoria. Cada log incluye:
 * - Quien realizo la accion (user_id)
 * - Que accion se realizo (action)
 * - Sobre que entidad (entity, entity_id)
 * - Cuando se realizo (created_at)
 * - Detalles adicionales (details)
 *
 * Acciones registradas:
 * - patient_created: Creacion de paciente
 * - patient_updated: Edicion de paciente
 * - reading_created: Registro de medicion de presion arterial
 * - history_viewed: Consulta de historial
 * - report_generated: Generacion de reporte
 * - login: Inicio de sesion
 * - logout: Cierre de sesion
 *
 * Cuando Supabase esta configurado, inserta en tabla audit_logs.
 * Si no, usa almacenamiento en memoria como fallback.
 */
import type { AuditLog } from '../types';
import { supabase } from '../lib/supabase';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const logs: AuditLog[] = [];

export const AuditService = {
  async log(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    description?: string,
  ): Promise<void> {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId,
      action,
      entity_type: entity,
      entity_id: entityId ?? null,
      details: description ? { description } : {},
      created_at: new Date().toISOString(),
    };

    if (USE_SUPABASE) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: entry.user_id,
          action: entry.action,
          entity: entry.entity_type,
          entity_id: entry.entity_id,
          details: entry.details,
          created_at: entry.created_at,
        });
      } catch (err) {
        console.error('Audit log Supabase insert failed, falling back to memory:', err);
        logs.push(entry);
      }
    } else {
      logs.push(entry);
    }
  },

  async getAll(): Promise<AuditLog[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          user_id: (row.user_id as string) ?? '',
          action: row.action as string,
          entity_type: (row.entity as string) ?? '',
          entity_id: (row.entity_id as string) ?? null,
          details: (row.details as Record<string, unknown>) ?? {},
          created_at: (row.created_at as string) ?? '',
        }));
      } catch {
        return [...logs].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    }

    await new Promise((r) => setTimeout(r, 50));
    return [...logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getRecent(count: number = 10): Promise<AuditLog[]> {
    const all = await this.getAll();
    return all.slice(0, count);
  },
};

/** Action constants for consistent logging */
export const AUDIT_ACTIONS = {
  PATIENT_CREATED: 'patient_created',
  PATIENT_UPDATED: 'patient_updated',
  READING_CREATED: 'reading_created',
  HISTORY_VIEWED: 'history_viewed',
  REPORT_GENERATED: 'report_generated',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

/** Human-readable labels for audit actions */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  patient_created: 'Creacion de paciente',
  patient_updated: 'Actualizacion de paciente',
  reading_created: 'Registro de medicion',
  history_viewed: 'Consulta de historial',
  report_generated: 'Generacion de reporte',
  login: 'Inicio de sesion',
  logout: 'Cierre de sesion',
};
