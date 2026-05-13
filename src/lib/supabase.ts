/**
 * Supabase Client Configuration
 *
 * HTA Cloud uses Supabase as its cloud backend platform, providing:
 * - Auth: User authentication (email/password), JWT sessions, role management
 * - PostgreSQL: Relational database for patients, readings, audit logs
 * - Storage: Object storage for clinical evidence and attachments
 * - RLS: Row Level Security policies restrict data access per authenticated user
 *
 * Environment variables (defined in .env, git-ignored):
 * - VITE_SUPABASE_URL: Project URL (e.g., https://xxx.supabase.co)
 * - VITE_SUPABASE_ANON_KEY: Public anonymous key (safe for frontend)
 *
 * The service_role key is NEVER exposed in the frontend.
 * All database access is protected by RLS policies.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
