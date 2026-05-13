import type { BPCategory, DashboardStats } from '../types';
import { supabase } from '../lib/supabase';
import { mockReadings, mockPatients } from '../data/mockData';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const ReportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    if (USE_SUPABASE) {
      const [patientsRes, readingsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: false }),
        supabase.from('blood_pressure_readings').select('systolic, diastolic, category'),
      ]);

      const allReadings = readingsRes.data ?? [];
      const categoryBreakdown: Record<BPCategory, number> = {
        normal: 0,
        elevated: 0,
        hta_stage1: 0,
        hta_stage2: 0,
        hta_grave: 0,
        hypertensive_crisis: 0,
      };

      let totalSystolic = 0;
      let totalDiastolic = 0;
      let criticalCount = 0;

      allReadings.forEach((r: { systolic: number; diastolic: number; category: string }) => {
        const cat = r.category as BPCategory;
        if (cat in categoryBreakdown) categoryBreakdown[cat]++;
        totalSystolic += r.systolic;
        totalDiastolic += r.diastolic;
        if (cat === 'hta_grave' || cat === 'hypertensive_crisis') criticalCount++;
      });

      const total = allReadings.length || 1;
      return {
        totalPatients: patientsRes.count ?? 0,
        totalReadings: allReadings.length,
        criticalReadings: criticalCount,
        averageSystolic: Math.round(totalSystolic / total),
        averageDiastolic: Math.round(totalDiastolic / total),
        categoryBreakdown,
      };
    }

    // Mock fallback
    await new Promise((r) => setTimeout(r, 200));
    const categoryBreakdown: Record<BPCategory, number> = {
      normal: 0,
      elevated: 0,
      hta_stage1: 0,
      hta_stage2: 0,
      hta_grave: 0,
      hypertensive_crisis: 0,
    };

    let totalSystolic = 0;
    let totalDiastolic = 0;
    let criticalCount = 0;

    mockReadings.forEach((r) => {
      categoryBreakdown[r.category]++;
      totalSystolic += r.systolic;
      totalDiastolic += r.diastolic;
      if (r.category === 'hta_grave' || r.category === 'hypertensive_crisis') {
        criticalCount++;
      }
    });

    return {
      totalPatients: mockPatients.length,
      totalReadings: mockReadings.length,
      criticalReadings: criticalCount,
      averageSystolic: Math.round(totalSystolic / mockReadings.length),
      averageDiastolic: Math.round(totalDiastolic / mockReadings.length),
      categoryBreakdown,
    };
  },

  async getCategorySummary(): Promise<{ category: BPCategory; count: number; percentage: number }[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('category');
      if (error) throw error;

      const allReadings = data ?? [];
      const total = allReadings.length || 1;
      const counts: Partial<Record<BPCategory, number>> = {};

      allReadings.forEach((r: { category: string }) => {
        const cat = r.category as BPCategory;
        counts[cat] = (counts[cat] || 0) + 1;
      });

      return (Object.entries(counts) as [BPCategory, number][]).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }));
    }

    // Mock fallback
    await new Promise((r) => setTimeout(r, 150));
    const total = mockReadings.length;
    const counts: Partial<Record<BPCategory, number>> = {};

    mockReadings.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    return (Object.entries(counts) as [BPCategory, number][]).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  },

  async getReadingsByMonth(): Promise<{ month: string; readings: number; avgSystolic: number; avgDiastolic: number }[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('systolic, diastolic, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;

      const allReadings = data ?? [];
      const monthMap: Record<string, { systolic: number[]; diastolic: number[] }> = {};

      allReadings.forEach((r: { systolic: number; diastolic: number; created_at: string }) => {
        const date = new Date(r.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) monthMap[key] = { systolic: [], diastolic: [] };
        monthMap[key].systolic.push(r.systolic);
        monthMap[key].diastolic.push(r.diastolic);
      });

      return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
          month,
          readings: d.systolic.length,
          avgSystolic: Math.round(d.systolic.reduce((a, b) => a + b, 0) / d.systolic.length),
          avgDiastolic: Math.round(d.diastolic.reduce((a, b) => a + b, 0) / d.diastolic.length),
        }));
    }

    // Mock fallback
    await new Promise((r) => setTimeout(r, 150));
    const monthMap: Record<string, { systolic: number[]; diastolic: number[] }> = {};

    mockReadings.forEach((r) => {
      const date = new Date(r.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { systolic: [], diastolic: [] };
      monthMap[key].systolic.push(r.systolic);
      monthMap[key].diastolic.push(r.diastolic);
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        readings: data.systolic.length,
        avgSystolic: Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length),
        avgDiastolic: Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length),
      }));
  },
};
