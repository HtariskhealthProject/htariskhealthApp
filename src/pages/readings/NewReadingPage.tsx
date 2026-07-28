import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { ReadingHistoryService } from '../../services/ReadingHistoryService';
import { useAuth } from '../../context/AuthContext';
import type {
  Patient,
  BloodPressureReadingFormData,
  AlarmSymptom,
  ReadingContext,
  ReadingMethod,
} from '../../types';
import {
  classifyBloodPressure,
  classifyHeartRate,
  HEART_RATE_CONFIG,
  DISCLAIMER,
} from '../../utils/classification';
import { ALARM_SYMPTOMS } from '../../types';
import { CONTEXT_LABELS, METHOD_LABELS } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ClinicalAlert from '../../components/ui/ClinicalAlert';
import EmptyState from '../../components/ui/EmptyState';
import { HeartPulse, Save, AlertTriangle, User, Activity } from 'lucide-react';

const initialFormData: BloodPressureReadingFormData = {
  patient_id: '',
  systolic: 0,
  diastolic: 0,
  heart_rate: 0,
  reading_context: 'consultation',
  reading_method: 'automatic',
  arm: 'left',
  position: 'sitting',
  alarm_symptoms: [],
  notes: '',
};

function NewReadingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<BloodPressureReadingFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getAll();
        setPatients(data);
      } catch {
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const classification =
    formData.systolic > 0 && formData.diastolic > 0
      ? classifyBloodPressure(formData.systolic, formData.diastolic, formData.alarm_symptoms)
      : null;

  const heartRateClassification =
  formData.heart_rate > 0
    ? classifyHeartRate(formData.heart_rate)
    : null;

const heartRateInfo = heartRateClassification
  ? HEART_RATE_CONFIG[heartRateClassification]
  : null;

  const isHypertensiveEmergency =
    (formData.systolic >= 180 || formData.diastolic >= 120) &&
    formData.alarm_symptoms.length > 0;

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find((p) => p.id === patientId) ?? null;
    setSelectedPatient(patient);
    setFormData((prev) => ({ ...prev, patient_id: patientId }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'systolic' || name === 'diastolic' || name === 'heart_rate'
          ? value === ''
            ? 0
            : parseInt(value, 10)
          : value,
    }));
  };

  const handleSymptomToggle = (symptom: AlarmSymptom) => {
    setFormData((prev) => ({
      ...prev,
      alarm_symptoms: prev.alarm_symptoms.includes(symptom)
        ? prev.alarm_symptoms.filter((s) => s !== symptom)
        : [...prev.alarm_symptoms, symptom],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await ReadingHistoryService.create(formData, user.id);
      navigate('/history');
    } catch {
      setError('Error al guardar la lectura. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Cargando pacientes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Medicion"
        subtitle="Captura de signos vitales de presion arterial"
        icon={<HeartPulse className="h-5 w-5" />}
      />

      {error && (
        <ClinicalAlert level="danger" title="Error">
          {error}
        </ClinicalAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Block 1: Datos del Paciente */}
        <SectionCard title="Datos del Paciente" icon={<User className="h-4 w-4" />}>
          <div>
            <label htmlFor="patient_id" className="label-clinical">
              Seleccionar Paciente
            </label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handlePatientChange}
              required
              className="select-clinical"
            >
              <option value="">-- Seleccione un paciente --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} - {p.document_number}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient ? (
            <div className="mt-4 rounded-lg border border-clinical-200 bg-clinical-50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="font-medium text-clinical-700">Nombre:</span>{' '}
                  <span className="text-slate-700">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-clinical-700">Documento:</span>{' '}
                  <span className="text-slate-700">
                    {selectedPatient.document_type} {selectedPatient.document_number}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-clinical-700">EPS:</span>{' '}
                  <span className="text-slate-700">{selectedPatient.eps || 'Sin asignar'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={<User className="h-6 w-6" />}
                title="Sin paciente seleccionado"
                description="Seleccione un paciente del listado para registrar la medicion"
              />
            </div>
          )}
        </SectionCard>

        {/* Block 2: Signos Registrados */}
        <SectionCard title="Signos Registrados" icon={<Activity className="h-4 w-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="systolic" className="label-clinical">
                Sistolica (mmHg)
              </label>
              <input
                id="systolic"
                name="systolic"
                type="number"
                min="0"
                max="300"
                value={formData.systolic || ''}
                onChange={handleChange}
                placeholder="Ej: 120"
                required
                className="input-clinical"
              />
            </div>

            <div>
              <label htmlFor="diastolic" className="label-clinical">
                Diastolica (mmHg)
              </label>
              <input
                id="diastolic"
                name="diastolic"
                type="number"
                min="0"
                max="200"
                value={formData.diastolic || ''}
                onChange={handleChange}
                placeholder="Ej: 80"
                required
                className="input-clinical"
              />
            </div>

            <div>
              <label htmlFor="heart_rate" className="label-clinical">
                Frecuencia Cardiaca (bpm)
              </label>
              <input
                id="heart_rate"
                name="heart_rate"
                type="number"
                min="0"
                max="300"
                value={formData.heart_rate || ''}
                onChange={handleChange}
                placeholder="Ej: 72"
                className="input-clinical"
              />
            </div>
          </div>

          {classification && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-slate-600">Clasificacion:</span>
                <StatusBadge category={classification.category} size="md" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{classification.message}</p>
              <p className="mt-1 text-sm text-slate-500">{classification.recommendation}</p>
            </div>
          )}
          {heartRateInfo && (
          <div
            className={`mt-4 rounded-lg border p-4 ${heartRateInfo.bgColor} ${heartRateInfo.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                Frecuencia cardíaca:
              </span>

              <span className={`font-semibold ${heartRateInfo.color}`}>
                {heartRateInfo.label}
              </span>
            </div>

            <p className="mt-2 text-sm">
              {heartRateInfo.message}
            </p>
          </div>
        )}
        </SectionCard>

        {/* Block 3: Sintomas de Alarma */}
        <SectionCard
          title="Sintomas de Alarma"
          subtitle="Seleccione los sintomas que presenta el paciente"
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(ALARM_SYMPTOMS) as [AlarmSymptom, string][]).map(
              ([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    formData.alarm_symptoms.includes(key)
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.alarm_symptoms.includes(key)}
                    onChange={() => handleSymptomToggle(key)}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span
                    className={`text-sm ${
                      formData.alarm_symptoms.includes(key)
                        ? 'font-medium text-red-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                </label>
              )
            )}
          </div>

          {isHypertensiveEmergency && (
            <div className="mt-4">
              <ClinicalAlert level="critical" title="Emergencia Hipertensiva">
                <p className="font-semibold">
                  PA {'>='} 180/120 mmHg con sintomas de alarma.
                </p>
                <p className="mt-1">
                  Se identifica una emergencia hipertensiva con posible dano organico agudo.
                  Reduccion inmediata de la presion arterial en UCI. Objetivo: reduccion del
                  25% en la primera hora. Evaluacion urgente requerida.
                </p>
              </ClinicalAlert>
            </div>
          )}
        </SectionCard>

        {/* Block 4: Contexto de la Medicion */}
        <SectionCard title="Contexto de la Medicion">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="reading_context" className="label-clinical">
                Contexto
              </label>
              <select
                id="reading_context"
                name="reading_context"
                value={formData.reading_context}
                onChange={handleChange}
                className="select-clinical"
              >
                {(Object.entries(CONTEXT_LABELS) as [ReadingContext, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="reading_method" className="label-clinical">
                Metodo
              </label>
              <select
                id="reading_method"
                name="reading_method"
                value={formData.reading_method}
                onChange={handleChange}
                className="select-clinical"
              >
                {(Object.entries(METHOD_LABELS) as [ReadingMethod, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="arm" className="label-clinical">
                Brazo
              </label>
              <select
                id="arm"
                name="arm"
                value={formData.arm}
                onChange={handleChange}
                className="select-clinical"
              >
                <option value="left">Izquierdo</option>
                <option value="right">Derecho</option>
              </select>
            </div>

            <div>
              <label htmlFor="position" className="label-clinical">
                Posicion
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="select-clinical"
              >
                <option value="sitting">Sentado</option>
                <option value="standing">De pie</option>
                <option value="lying">Acostado</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Block 5: Observaciones */}
        <SectionCard title="Observaciones">
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Observaciones adicionales sobre la lectura..."
            className="input-clinical resize-y"
          />
        </SectionCard>

        {/* Result Preview */}
        {classification && (
          <SectionCard title="Resultado de la Clasificacion">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-shrink-0">
                <StatusBadge category={classification.category} size="md" showDot />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-slate-800">{classification.message}</p>
                <p className="text-sm text-slate-600">{classification.recommendation}</p>
              </div>
            </div>
            {classification.alertLevel === 'critical' && (
              <div className="mt-4">
                <ClinicalAlert level="critical" title="Atencion Inmediata Requerida">
                  Esta lectura indica una condicion critica que requiere intervencion clinica
                  inmediata. No demore la evaluacion del paciente.
                </ClinicalAlert>
              </div>
            )}
          </SectionCard>
        )}

        {/* Disclaimer */}
        <ClinicalAlert level="info" title="Herramienta de Apoyo Clinico">
          {DISCLAIMER}
        </ClinicalAlert>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {isHypertensiveEmergency && (
            <div className="mr-auto flex items-center gap-2 text-sm text-red-600 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Emergencia Hipertensiva detectada
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !formData.patient_id}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Lectura'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewReadingPage;
