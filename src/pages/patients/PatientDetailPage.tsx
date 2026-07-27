import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { ReadingHistoryService } from '../../services/ReadingHistoryService';
import type { Patient, BloodPressureReading } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ClinicalAlert from '../../components/ui/ClinicalAlert';
import RecordTimeline from '../../components/ui/RecordTimeline';
import TrendChartCard from '../../components/ui/TrendChartCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  formatDate,
  formatBP,
  formatMAP,
  DOCUMENT_TYPE_LABELS,
  SEX_LABELS,
  CONTEXT_LABELS,
} from '../../utils/formatters';
import { classifyBloodPressure, DISCLAIMER } from '../../utils/classification';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  CreditCard as Edit,
  User,
  Phone,
  MapPin,
  Heart,
  Activity,
  FileText,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientData, readingsData] = await Promise.all([
          PatientService.getById(id),
          ReadingHistoryService.getByPatient(id),
        ]);
        if (!patientData) {
          setError('Paciente no encontrado');
          return;
        }
        setPatient(patientData);
        setReadings(readingsData);
      } catch {
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Paciente no encontrado'}</p>
        <Link
          to="/patients"
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pacientes
        </Link>
      </div>
    );
  }

  const latestReading = readings.length > 0 ? readings[0] : null;
  const latestClassification = latestReading
    ? classifyBloodPressure(latestReading.systolic, latestReading.diastolic, latestReading.alarm_symptoms)
    : null;

  const chartData = [...readings]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((r) => ({
      date: formatDate(r.created_at),
      sistolica: r.systolic,
      diastolica: r.diastolic,
    }));

  const bmiCategory =
    patient.bmi < 18.5
      ? 'Bajo peso'
      : patient.bmi < 25
        ? 'Normal'
        : patient.bmi < 30
          ? 'Sobrepeso'
          : 'Obesidad';

  const hasCriticalReadings = latestClassification
    ? latestClassification.alertLevel === 'danger' || latestClassification.alertLevel === 'critical'
    : false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${patient.first_name} ${patient.last_name}`}
        subtitle="Expediente Clinico"
        icon={<FileText className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/patients"
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Pacientes
            </Link>
            <Link
              to={`/patients/${id}/edit`}
              className="btn-primary"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </div>
        }
      />

      {/* Top Row: Patient Info + Latest Reading Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Patient Info Card */}
        <SectionCard
          title="Informacion Personal"
          icon={<User className="h-4 w-4" />}
          className="lg:col-span-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Documento
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {DOCUMENT_TYPE_LABELS[patient.document_type]} {patient.document_number}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sexo</p>
              <p className="mt-1 text-sm text-slate-800">{SEX_LABELS[patient.sex]}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Fecha de Nacimiento
              </p>
              <p className="mt-1 text-sm text-slate-800 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(patient.birth_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Telefono
              </p>
              <p className="mt-1 text-sm text-slate-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {patient.phone || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Email
              </p>
              <p className="mt-1 text-sm text-slate-800">{patient.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Direccion
              </p>
              <p className="mt-1 text-sm text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {[patient.address, patient.city].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">EPS</p>
              <p className="mt-1 text-sm text-slate-800">{patient.eps || '—'}</p>
            </div>
          </div>
        </SectionCard>

        {/* Latest Reading Summary Card */}
        {latestReading && latestClassification ? (
          <div
            className={`lg:col-span-2 rounded-xl border-l-4 overflow-hidden`}
            style={{ borderLeftColor: latestClassification.color }}
          >
            <SectionCard
              title="Ultima Lectura"
              icon={<Activity className="h-4 w-4" />}
              actions={<StatusBadge category={latestClassification.category} size="md" />}
              className="border-l-0"
            >
              <p className="text-sm text-slate-600 mb-4">
                {formatDate(latestReading.created_at)} —{' '}
                {CONTEXT_LABELS[latestReading.reading_context]}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">PA</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatBP(latestReading.systolic, latestReading.diastolic)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">FC</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {latestReading.heart_rate} lpm
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">PAM</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatMAP(latestReading.mean_arterial_pressure)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Clasificacion</p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: latestClassification.color }}
                  >
                    {latestClassification.message}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          <SectionCard
            title="Ultima Lectura"
            icon={<Activity className="h-4 w-4" />}
            className="lg:col-span-2"
          >
            <p className="text-sm text-slate-400">Sin lecturas registradas</p>
          </SectionCard>
        )}
      </div>

      {/* Clinical Alert for critical readings */}
      {hasCriticalReadings && latestClassification && (
        <ClinicalAlert level={latestClassification.alertLevel} title="Alerta Clinica">
          {latestClassification.recommendation}
        </ClinicalAlert>
      )}

      {/* Clinical Data Row: Anthropometrics + Comorbidities + Medications + Family History */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Anthropometrics */}
        <SectionCard title="Antropometria" icon={<Heart className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-3">
              <p className="text-xs font-medium text-clinical-700 uppercase tracking-wide">Peso</p>
              <p className="mt-1 text-lg font-bold text-clinical-800">{patient.weight_kg} kg</p>
            </div>
            <div className="rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-3">
              <p className="text-xs font-medium text-clinical-700 uppercase tracking-wide">Altura</p>
              <p className="mt-1 text-lg font-bold text-clinical-800">{patient.height_m} m</p>
            </div>
            <div className="rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-3">
              <p className="text-xs font-medium text-clinical-700 uppercase tracking-wide">IMC</p>
              <p className="mt-1 text-lg font-bold text-clinical-800">
                {patient.bmi} — {bmiCategory}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Comorbidities */}
        <SectionCard title="Comorbilidades" icon={<FileText className="h-4 w-4" />}>
          {patient.comorbidities.length > 0 ? (
            <ul className="space-y-1.5">
              {patient.comorbidities.map((c, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5"
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ninguna registrada</p>
          )}
        </SectionCard>

        {/* Medications */}
        <SectionCard title="Medicamentos" icon={<Activity className="h-4 w-4" />}>
          {patient.medications.length > 0 ? (
            <ul className="space-y-1.5">
              {patient.medications.map((m, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5"
                >
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ninguno registrado</p>
          )}
        </SectionCard>

        {/* Family History */}
        <SectionCard title="Antecedentes Familiares" icon={<Heart className="h-4 w-4" />}>
          {patient.family_history.length > 0 ? (
            <ul className="space-y-1.5">
              {patient.family_history.map((fh, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5"
                >
                  {fh}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ninguno registrado</p>
          )}
        </SectionCard>
      </div>

      {/* BP Evolution Chart */}
      {chartData.length > 1 ? (
        <TrendChartCard
          title="Evolucion de Presion Arterial"
          subtitle={`${readings.length} lecturas registradas`}
          icon={<Activity className="h-4 w-4" />}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[40, 200]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <ReferenceLine
                  y={120}
                  stroke="#1e40af"
                  strokeDasharray="5 5"
                  label={{ value: '120', position: 'right', fill: '#1e40af', fontSize: 11 }}
                />
                <ReferenceLine
                  y={140}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  label={{ value: '140', position: 'right', fill: '#dc2626', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="sistolica"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#1e40af' }}
                  name="Sistolica"
                />
                <Line
                  type="monotone"
                  dataKey="diastolica"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#475569' }}
                  name="Diastolica"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendChartCard>
      ) : null}

      {/* Readings Timeline */}
      {readings.length > 0 ? (
        <SectionCard
          title="Historial de Lecturas"
          subtitle={`${readings.length} registros`}
          icon={<Activity className="h-4 w-4" />}
          actions={
            <Link
              to="/history"
              className="text-sm font-medium text-clinical-600 hover:text-clinical-700 transition-colors"
            >
              Ver Historial
            </Link>
          }
        >
          <RecordTimeline readings={readings} maxItems={10} />
        </SectionCard>
      ) : (
        <EmptyState
          icon={<Activity className="h-7 w-7" />}
          title="Sin lecturas registradas"
          description="No hay lecturas de presion arterial registradas para este paciente."
          action={
            <Link
              to="/readings/new"
              className="btn-primary"
            >
              Registrar Primera Lectura
            </Link>
          }
        />
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          to="/readings/new"
          className="btn-primary"
        >
          <Activity className="h-4 w-4" />
          Nueva Medicion
        </Link>
        <Link
          to="/history"
          className="btn-secondary"
        >
          <FileText className="h-4 w-4" />
          Ver Historial
        </Link>
      </div>

      {/* Clinical Disclaimer */}
      <ClinicalAlert level="info" title="Herramienta de Apoyo Clinico">
        {DISCLAIMER}
      </ClinicalAlert>
    </div>
  );
}

export default PatientDetailPage;
