import { useState, useEffect, useMemo } from 'react';
import { ReportService } from '../../services/ReportService';
import type { DashboardStats, BPCategory } from '../../types';
import { BP_CATEGORY_LABELS } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import TrendChartCard from '../../components/ui/TrendChartCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  FileBarChart,
  Users,
  HeartPulse,
  AlertTriangle,
  Activity,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_COLORS: Record<BPCategory, string> = {
  normal: '#16a34a',
  elevated: '#ca8a04',
  hta_stage1: '#ea580c',
  hta_stage2: '#dc2626',
  hta_grave: '#991b1b',
  hypertensive_crisis: '#7f1d1d',
};

interface MonthlyData {
  month: string;
  readings: number;
  avgSystolic: number;
  avgDiastolic: number;
}

interface CategorySummary {
  category: BPCategory;
  count: number;
  percentage: number;
}

interface HeartRateData {
  month: string;
  avgHeartRate: number;
}

interface BMIData {
  month: string;
  avgBMI: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [bmiData, setBmiData] = useState<BMIData[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dashboardStats, monthData, catSummary, heartRate, bmi] = await Promise.all([
          ReportService.getDashboardStats(),
          ReportService.getReadingsByMonth(),
          ReportService.getCategorySummary(),
          ReportService.getHeartRateByMonth(),
          ReportService.getBMIByMonth(),
        ]);
        setStats(dashboardStats);
        setMonthlyData(monthData);
        setCategorySummary(catSummary);
        setHeartRateData(heartRate);
        setBmiData(bmi);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredMonthlyData = monthlyData.filter((item) => {
    if (dateFrom && item.month < dateFrom) return false;
    if (dateTo && item.month > dateTo) return false;
    return true;
  });

  const pieData = categorySummary.map((item) => ({
    name: BP_CATEGORY_LABELS[item.category],
    value: item.count,
    category: item.category,
  }));

  const keyFindings = useMemo(() => {
    if (!stats || categorySummary.length === 0) return [];
    const findings: { icon: React.ReactNode; text: string; variant: 'info' | 'warning' | 'critical' }[] = [];

    const criticalCategories = categorySummary.filter(
      (c) => c.category === 'hta_grave' || c.category === 'hypertensive_crisis'
    );
    const criticalTotal = criticalCategories.reduce((sum, c) => sum + c.count, 0);
    const criticalPct = Math.round((criticalTotal / stats.totalReadings) * 100);

    if (criticalPct > 0) {
      findings.push({
        icon: <AlertTriangle className="w-4 h-4" />,
        text: `${criticalTotal} mediciones criticas (${criticalPct}%) requieren atencion inmediata o seguimiento intensivo.`,
        variant: 'critical',
      });
    }

    if (stats.averageSystolic >= 130) {
      findings.push({
        icon: <Activity className="w-4 h-4" />,
        text: `PA promedio sistolica elevada (${stats.averageSystolic}/${stats.averageDiastolic} mmHg). Considerar ajuste terapeutico.`,
        variant: 'warning',
      });
    } else {
      findings.push({
        icon: <Activity className="w-4 h-4" />,
        text: `PA promedio sistolica dentro de rango controlado (${stats.averageSystolic}/${stats.averageDiastolic} mmHg).`,
        variant: 'info',
      });
    }

    const normalItem = categorySummary.find((c) => c.category === 'normal');
    if (normalItem) {
      findings.push({
        icon: <TrendingUp className="w-4 h-4" />,
        text: `${normalItem.percentage}% de mediciones en categoria Normal. ${normalItem.percentage >= 50 ? 'Buen control global.' : 'Control suboptimo.'}`,
        variant: normalItem.percentage >= 50 ? 'info' : 'warning',
      });
    }

    if (stats.totalPatients > 0 && stats.totalReadings > 0) {
      const avgPerPatient = (stats.totalReadings / stats.totalPatients).toFixed(1);
      findings.push({
        icon: <Users className="w-4 h-4" />,
        text: `Promedio de ${avgPerPatient} mediciones por paciente en el periodo analizado.`,
        variant: 'info',
      });
    }

    return findings;
  }, [stats, categorySummary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Reportes Clinicos"
        subtitle="Analisis estadistico de mediciones y clasificaciones"
        icon={<FileBarChart className="w-5 h-5" />}
      />

      {/* 2. Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pacientes"
          value={stats.totalPatients}
          icon={<Users className="w-5 h-5" />}
          color="clinical"
        />
        <StatCard
          title="Total Mediciones"
          value={stats.totalReadings}
          icon={<HeartPulse className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Alertas Activas"
          value={stats.criticalReadings}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="PA Promedio"
          value={`${stats.averageSystolic}/${stats.averageDiastolic}`}
          icon={<Activity className="w-5 h-5" />}
          color="amber"
          subtitle="mmHg (Sistolica/Diastolica)"
        />
      </div>

      {/* 3. Charts Row: Monthly Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <TrendChartCard
          title="Promedio de Mediciones por Mes"
          subtitle="Evolucion de presion arterial sistolica y diastolica"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 text-sm mb-3 -mt-1">
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-xs">Desde:</label>
              <input
                type="month"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-clinical-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-xs">Hasta:</label>
              <input
                type="month"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-clinical-500"
              />
            </div>
          </div>
          {filteredMonthlyData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="avgSystolic"
                    name="Sistolica Promedio"
                    fill="#1e40af"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avgDiastolic"
                    name="Diastolica Promedio"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="w-6 h-6" />}
              title="Sin datos en el rango seleccionado"
              description="Ajuste el filtro de fechas para ver resultados."
            />
          )}
        </TrendChartCard>

        {/* Pie Chart */}
        <SectionCard
          title="Distribucion por Categoria"
          subtitle="Proporcion de mediciones por clasificacion clinica"
          icon={<Activity className="w-4 h-4" />}
        >
          {pieData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category as BPCategory]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<FileBarChart className="w-6 h-6" />}
              title="Sin datos de categorias"
              description="No se encontraron mediciones para clasificar."
            />
          )}
        </SectionCard>
      </div>

      {/* 3b. Heart Rate & BMI Trend Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChartCard
          title="Evolucion de Frecuencia Cardiaca"
          subtitle="Promedio mensual de frecuencia cardiaca"
          icon={<HeartPulse className="w-4 h-4" />}
        >
          {heartRateData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHeartRate"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Frecuencia Cardiaca"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<HeartPulse className="w-6 h-6" />}
              title="Sin datos de frecuencia cardiaca"
              description="No se encontraron mediciones para mostrar."
            />
          )}
        </TrendChartCard>

        <TrendChartCard
          title="Evolucion del IMC"
          subtitle="Promedio mensual del indice de masa corporal"
          icon={<Activity className="w-4 h-4" />}
        >
          {bmiData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bmiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: 13,
                    }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="avgBMI"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="IMC"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="w-6 h-6" />}
              title="Sin datos de IMC"
              description="No se encontraron registros para mostrar."
            />
          )}
        </TrendChartCard>
      </div>

      {/* 4. Category Summary Cards Row */}
      <SectionCard
        title="Resumen por Categoria"
        subtitle="Detalle de mediciones y porcentaje por cada clasificacion de presion arterial"
        icon={<HeartPulse className="w-4 h-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categorySummary.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                />
                <StatusBadge category={item.category} showDot={false} size="md" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-800">
                  {item.count}
                </span>
                <span className="text-sm font-medium text-slate-500 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5. Key Findings Section */}
      <SectionCard
        title="Hallazgos Clave"
        subtitle="Insights analiticos del periodo evaluado"
        icon={<TrendingUp className="w-4 h-4" />}
      >
        <div className="space-y-3">
          {keyFindings.map((finding, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-lg p-3 ${
                finding.variant === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : finding.variant === 'warning'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-clinical-50 border border-clinical-200'
              }`}
            >
              <span
                className={`flex-shrink-0 mt-0.5 ${
                  finding.variant === 'critical'
                    ? 'text-red-600'
                    : finding.variant === 'warning'
                      ? 'text-amber-600'
                      : 'text-clinical-600'
                }`}
              >
                {finding.icon}
              </span>
              <p
                className={`text-sm leading-relaxed ${
                  finding.variant === 'critical'
                    ? 'text-red-800'
                    : finding.variant === 'warning'
                      ? 'text-amber-800'
                      : 'text-clinical-800'
                }`}
              >
                {finding.text}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
