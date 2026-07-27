import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ClinicalAlert from '../../components/ui/ClinicalAlert';
import SectionCard from '../../components/ui/SectionCard';
import TrendChartCard from '../../components/ui/TrendChartCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ReportService } from '../../services/ReportService';
import { ReadingHistoryService } from '../../services/ReadingHistoryService';
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
  Legend,
  LabelList,
  Cell,
} from 'recharts';
import {
  Users,
  HeartPulse,
  AlertTriangle,
  Activity,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react';
import {
  DashboardStats,
  BloodPressureReading,
  BPCategory,
  BP_CATEGORY_LABELS,
} from '../../types';
import { formatDateTime, formatBP } from '../../utils/formatters';
import { classifyBloodPressure } from '../../utils/classification';
import { PatientService } from '../../services/PatientService';
import { Patient } from '../../types';

const CATEGORY_COLORS: Record<BPCategory, string> = {
  normal: '#16a34a',
  elevated: '#ca8a04',
  hta_stage1: '#ea580c',
  hta_stage2: '#dc2626',
  hta_grave: '#991b1b',
  hypertensive_crisis: '#7f1d1d',
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReadings, setRecentReadings] = useState<BloodPressureReading[]>([]);
  const [criticalReadings, setCriticalReadings] = useState<BloodPressureReading[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, recent, critical, patientsData] =
        await Promise.all([
            ReportService.getDashboardStats(),
            ReadingHistoryService.getRecent(5),
            ReadingHistoryService.getCritical(),
            PatientService.getAll(),
        ]);
        setStats(dashboardStats);
        setRecentReadings(recent);
        setCriticalReadings(critical);
        setPatients(patientsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const categoryBarData = stats
    ? Object.entries(stats.categoryBreakdown).map(([category, count]) => ({
        name: BP_CATEGORY_LABELS[category as BPCategory] || category,
        count,
        fill: CATEGORY_COLORS[category as BPCategory],
      }))
    : [];

  const categoryPieData = stats
    ? Object.entries(stats.categoryBreakdown)
        .filter(([, count]) => count > 0)
        .map(([category, count]) => ({
          name: BP_CATEGORY_LABELS[category as BPCategory] || category,
          value: count,
          category: category as BPCategory,
        }))
    : [];

  const insights = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalReadings;
    const normalCount = stats.categoryBreakdown.normal ?? 0;
    const normalPct = total > 0 ? Math.round((normalCount / total) * 100) : 0;

    const elevatedCount =
      (stats.categoryBreakdown.elevated ?? 0) +
      (stats.categoryBreakdown.hta_stage1 ?? 0);
    const severeCount =
      (stats.categoryBreakdown.hta_stage2 ?? 0) +
      (stats.categoryBreakdown.hta_grave ?? 0) +
      (stats.categoryBreakdown.hypertensive_crisis ?? 0);

    let trendLabel = 'estable';
    if (severeCount > normalCount) trendLabel = 'al alza';
    else if (normalCount > severeCount + elevatedCount) trendLabel = 'a la baja';

    return [
      `${normalPct}% de mediciones en rango normal`,
      `Tendencia: PA promedio ${trendLabel}`,
      `${stats.criticalReadings} caso${stats.criticalReadings !== 1 ? 's' : ''} critico${stats.criticalReadings !== 1 ? 's' : ''} activo${stats.criticalReadings !== 1 ? 's' : ''}`,
    ];
  }, [stats]);

  const getPatientName = (patientId: string) => {
  const patient = patients.find(p => p.id === patientId);

  if (!patient) return "Desconocido";

  return `${patient.first_name} ${patient.last_name}`;
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Clinico"
        subtitle="Resumen general de clasificacion de riesgo HTA"
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pacientes"
          value={stats?.totalPatients ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="clinical"
        />
        <StatCard
          title="Total Mediciones"
          value={stats?.totalReadings ?? 0}
          icon={<HeartPulse className="h-5 w-5" />}
          color="slate"
        />
        <StatCard
          title="Alertas Activas"
          value={stats?.criticalReadings ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Casos Criticos"
          value={stats?.criticalReadings ?? 0}
          icon={<Activity className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-clinical-200 bg-clinical-50 px-4 py-3"
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0 text-clinical-600" />
              <span className="text-sm font-medium text-clinical-900">{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart - Category Distribution */}
        <TrendChartCard
          title="Distribucion por Categoria"
          subtitle="Cantidad de mediciones por clasificacion"
          className="lg:col-span-2"
          icon={<LayoutDashboard className="h-4 w-4" />}
        >
          {categoryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={categoryBarData}
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12, fill: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={((value: number | string) => [value, 'Mediciones']) as any}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    <LabelList dataKey="count" position="right" />
                    {categoryBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Sin datos de distribucion"
              description="No hay mediciones disponibles para mostrar la distribucion por categoria"
            />
          )}
        </TrendChartCard>

        {/* Pie Chart - Category Proportions */}
        <SectionCard title="Proporcion por Categoria" icon={<Activity className="h-4 w-4" />}>
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={false}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell
                      key={`pie-${index}`}
                      fill={CATEGORY_COLORS[entry.category]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 13,
                    paddingTop: 10,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={((value: number | string) => [value, 'Mediciones']) as any}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="Sin datos de proporcion"
              description="No hay mediciones disponibles para mostrar la proporcion por categoria"
            />
          )}
        </SectionCard>
      </div>

      {/* Bottom Section: Recent Readings + Critical Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent Readings Table */}
        <SectionCard
          title="Lecturas Recientes"
          subtitle="Ultimas 5 mediciones registradas"
          icon={<HeartPulse className="h-4 w-4" />}
          className="lg:col-span-3"
          noPadding
        >
          {recentReadings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-clinical-50 text-left">
                    <th className="px-4 py-3 font-medium text-clinical-700">
                      Paciente
                    </th>
                    <th className="px-4 py-3 font-medium text-clinical-700">
                      PA
                    </th>
                    <th className="px-4 py-3 font-medium text-clinical-700">
                      Categoria
                    </th>
                    <th className="px-4 py-3 font-medium text-clinical-700">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentReadings.map((reading) => {
                    const category = classifyBloodPressure(
                      reading.systolic,
                      reading.diastolic,
                    );
                    return (
                      <tr
                        key={reading.id}
                        className="border-b border-slate-100 transition-colors hover:bg-clinical-50"
                      >
                        <td className="px-4 py-3 text-slate-700">
                          {getPatientName(reading.patient_id)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {formatBP(reading.systolic, reading.diastolic)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge category={category.category} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDateTime(reading.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<HeartPulse className="h-6 w-6" />}
              title="Sin lecturas recientes"
              description="No se han registrado mediciones recientemente"
            />
          )}
        </SectionCard>

        {/* Critical Alerts */}
        <SectionCard
          title="Alertas Criticas"
          subtitle="Mediciones que requieren atencion inmediata"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          className="lg:col-span-2"
        >
          {criticalReadings.length > 0 ? (
            <div className="space-y-3">
              {criticalReadings.slice(0, 5).map((reading) => {
                const bpFormatted = formatBP(reading.systolic, reading.diastolic);
                const patientName = getPatientName(reading.patient_id);
                return (
                  <ClinicalAlert
                    key={reading.id}
                    level="critical"
                    title={patientName}
                  >
                    {formatDateTime(reading.created_at)}
                  </ClinicalAlert>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Sin alertas criticas"
              description="Todas las lecturas estan dentro de rangos aceptables"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardPage;
