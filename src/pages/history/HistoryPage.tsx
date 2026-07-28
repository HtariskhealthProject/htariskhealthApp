import { useState, useEffect } from 'react';
import { ReadingHistoryService } from '../../services/ReadingHistoryService';
import type { BloodPressureReading, BPCategory, Patient } from '../../types';
import { BP_CATEGORY_LABELS } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import TrendChartCard from '../../components/ui/TrendChartCard';
import RecordTimeline from '../../components/ui/RecordTimeline';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, formatBP, CONTEXT_LABELS } from '../../utils/formatters';
import { PatientService } from '../../services/PatientService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { History, Filter } from 'lucide-react';

const CATEGORY_COLORS: Record<BPCategory, string> = {
  normal: '#16a34a',
  elevated: '#ca8a04',
  hta_stage1: '#ea580c',
  hta_stage2: '#dc2626',
  hta_grave: '#991b1b',
  hypertensive_crisis: '#7f1d1d',
};

export default function HistoryPage() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [readingData, patientData] = await Promise.all([
        ReadingHistoryService.getAll(),
        PatientService.getAll(),
      ]);

      setReadings(readingData);
      setPatients(patientData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

const getPatientName = (patientId: string) => {
  const patient = patients.find((p) => p.id === patientId);

  return patient
    ? `${patient.first_name} ${patient.last_name}`
    : 'Desconocido';
};

  const filteredReadings = readings.filter((reading) => {
    if (patientSearch) {
      const name = getPatientName(reading.patient_id).toLowerCase();
      if (!name.includes(patientSearch.toLowerCase())) return false;
    }
    if (categoryFilter && reading.category !== categoryFilter) return false;
    if (dateFrom && new Date(reading.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(reading.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const sortedForChart = [...filteredReadings].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const lineChartData = sortedForChart.map((reading) => ({
    date: new Date(reading.created_at).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
    }),
    sistolica: reading.systolic,
    diastolica: reading.diastolic,
  }));

  const categoryCountMap: Record<string, number> = {};
  filteredReadings.forEach((reading) => {
    categoryCountMap[reading.category] = (categoryCountMap[reading.category] || 0) + 1;
  });

  const pieChartData = Object.entries(categoryCountMap).map(([category, count]) => ({
    name: BP_CATEGORY_LABELS[category as BPCategory] || category,
    value: count,
    category: category as BPCategory,
  }));

  const sortedForTimeline = [...filteredReadings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Historial de Mediciones"
        subtitle="Registro completo de mediciones de presion arterial"
        icon={<History className="w-5 h-5" />}
      />

      {/* Filter Bar */}
      <FilterBar>
        <FilterBar.Item label="Paciente">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500"
          />
        </FilterBar.Item>
        <FilterBar.Item label="Categoria">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500"
          >
            <option value="">Todas</option>
            {Object.entries(BP_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </FilterBar.Item>
        <FilterBar.Item label="Desde">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500"
          />
        </FilterBar.Item>
        <FilterBar.Item label="Hasta">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500"
          />
        </FilterBar.Item>
      </FilterBar>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart - BP Trends */}
        <TrendChartCard
          title="Tendencia de Presion Arterial"
          subtitle="Evolucion sistolica y diastolica"
          className="lg:col-span-2"
        >
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineChartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  domain={[40, 200]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={((value: number | string, name: string) => {
                    const label = name === 'sistolica' ? 'Sistolica' : 'Diastolica';
                    return [`${value} mmHg`, label];
                  }) as any}
                />
                <Line
                  type="monotone"
                  dataKey="sistolica"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#1e40af' }}
                  activeDot={{ r: 5 }}
                  name="sistolica"
                />
                <Line
                  type="monotone"
                  dataKey="diastolica"
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#64748b' }}
                  activeDot={{ r: 5 }}
                  name="diastolica"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<Filter className="w-6 h-6" />}
              title="Sin datos"
              description="No hay datos disponibles para los filtros seleccionados"
            />
          )}
        </TrendChartCard>

        {/* Pie Chart - Category Distribution */}
        <SectionCard
        title="Distribucion por Categoria"
        subtitle="Proporcion por categoria clinica"
      >
        {pieChartData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={118}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`pie-${index}`}
                        fill={CATEGORY_COLORS[entry.category]}
                        stroke="#ffffff"
                        strokeWidth={4}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                    formatter={
                    ((value: number | string) => [
                      `${value} mediciones`,
                      "Cantidad",
                    ]) as any
                  }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-1 gap-2">
              {pieChartData.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[item.category],
                      }}
                    />

                    <span className="text-sm text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      {(
                        (item.value /
                          pieChartData.reduce(
                            (sum, current) => sum + current.value,
                            0
                          )) *
                        100
                      ).toFixed(0)}
                      %
                    </span>

                    <span className="font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Filter className="w-6 h-6" />}
            title="Sin datos"
            description="No hay datos disponibles para los filtros seleccionados"
          />
        )}
      </SectionCard>
      </div>

      {/* Readings: Table + Timeline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Readings Table */}
        <SectionCard
          title={`Lecturas (${filteredReadings.length})`}
          subtitle="Tabla de mediciones"
          className="xl:col-span-2"
          noPadding
        >
          {filteredReadings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Paciente
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Fecha
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      PA
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      FC
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      PAM
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Contexto
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Categoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((reading) => (
                    <tr
                      key={reading.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        {getPatientName(reading.patient_id)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(reading.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {formatBP(reading.systolic, reading.diastolic)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {reading.heart_rate} lpm
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {reading.mean_arterial_pressure} mmHg
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {CONTEXT_LABELS[reading.reading_context]}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge category={reading.category} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Filter className="w-6 h-6" />}
              title="Sin resultados"
              description="No se encontraron lecturas con los filtros seleccionados"
            />
          )}
        </SectionCard>

        {/* Record Timeline */}
        <SectionCard
          title="Linea de Tiempo"
          subtitle="Ultimas mediciones"
          className="xl:col-span-1"
        >
          {sortedForTimeline.length > 0 ? (
            <RecordTimeline readings={sortedForTimeline} maxItems={10} />
          ) : (
            <EmptyState
              icon={<Filter className="w-6 h-6" />}
              title="Sin resultados"
              description="No se encontraron lecturas con los filtros seleccionados"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
