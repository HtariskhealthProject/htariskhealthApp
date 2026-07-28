import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { useAuth } from '../../context/AuthContext';
import type { PatientFormData, DocumentType, Sex } from '../../types';
import { DOCUMENT_TYPE_LABELS, SEX_LABELS } from '../../utils/formatters';
import { calculateBMI } from '../../utils/classification';
import { Save, ArrowLeft } from 'lucide-react';

const initialFormData: PatientFormData = {
  document_type: 'CC',
  document_number: '',
  first_name: '',
  last_name: '',
  sex: 'M',
  birth_date: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  eps: '',
  weight_kg: 0,
  height_m: 0,
  comorbidities: [],
  medications: [],
  family_history: [],
  notes: '',
};

function PatientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comorbiditiesText, setComorbiditiesText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [familyHistoryText, setFamilyHistoryText] = useState('');

  const bmi =
    formData.weight_kg > 0 && formData.height_m > 0
      ? calculateBMI(formData.weight_kg, formData.height_m)
      : null;

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const patient = await PatientService.getById(id);
        if (!patient) {
          setError('Paciente no encontrado');
          return;
        }
        setFormData({
          document_type: patient.document_type,
          document_number: patient.document_number,
          first_name: patient.first_name,
          last_name: patient.last_name,
          sex: patient.sex,
          birth_date: patient.birth_date,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          city: patient.city,
          eps: patient.eps,
          weight_kg: patient.weight_kg,
          height_m: patient.height_m,
          comorbidities: patient.comorbidities,
          medications: patient.medications,
          family_history: patient.family_history,
          notes: patient.notes,
        });
        setComorbiditiesText(patient.comorbidities.join(', '));
        setMedicationsText(patient.medications.join(', '));
        setFamilyHistoryText(patient.family_history.join(', '));
      } catch {
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'weight_kg' || name === 'height_m'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
    setError('Debe ingresar el nombre completo del paciente.');
    return;
  }

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!nameRegex.test(formData.first_name.trim())) {
    setError('Los nombres solo pueden contener letras.');
    return;
  }

  if (!nameRegex.test(formData.last_name.trim())) {
    setError('Los apellidos solo pueden contener letras.');
    return;
  }


    setSaving(true);
    setError(null);

    const submitData: PatientFormData = {
      ...formData,
      comorbidities: comorbiditiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      medications: medicationsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      family_history: familyHistoryText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      let patientId: string;
      if (isEditMode && id) {
        await PatientService.update(id, submitData);
        patientId = id;
      } else {
        const patient = await PatientService.create(submitData, user.id);
        patientId = patient.id;
      }
      navigate(`/patients/${patientId}`);
    } catch {
      setError('Error al guardar el paciente. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Cargando datos del paciente...
      </div>
    );
  }

  if (error && !formData.document_number) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/patients')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pacientes
        </button>
      </div>
    );
  }

  const inputClass = 'input-clinical';
  const labelClass = 'label-clinical';
  const selectClass = 'select-clinical';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h1>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Informacion Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="document_type" className={labelClass}>
                Tipo de Documento
              </label>
              <select
                id="document_type"
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                className={selectClass}
              >
                {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="document_number" className={labelClass}>
                Numero de Documento
              </label>
              <input
                id="document_number"
                name="document_number"
                type="text"
                value={formData.document_number}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="first_name" className={labelClass}>
                Nombres
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Nombres del paciente"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="last_name" className={labelClass}>
                Apellidos
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Apellidos del paciente"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sex" className={labelClass}>
                Sexo
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className={selectClass}
              >
                {(Object.entries(SEX_LABELS) as [Sex, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="birth_date" className={labelClass}>
                Fecha de Nacimiento
              </label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Informacion de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelClass}>
                Telefono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className={labelClass}>
                Direccion
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Direccion de residencia"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="city" className={labelClass}>
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ciudad"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="eps" className={labelClass}>
                EPS
              </label>
              <input
                id="eps"
                name="eps"
                type="text"
                value={formData.eps}
                onChange={handleChange}
                placeholder="Entidad promotora de salud"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Informacion Clinica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight_kg" className={labelClass}>
                Peso (kg)
              </label>
              <input
                id="weight_kg"
                name="weight_kg"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight_kg || ''}
                onChange={handleChange}
                placeholder="Ej: 70"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="height_m" className={labelClass}>
                Altura (m)
              </label>
              <input
                id="height_m"
                name="height_m"
                type="number"
                min="0"
                step="0.01"
                value={formData.height_m || ''}
                onChange={handleChange}
                placeholder="Ej: 1.70"
                className={inputClass}
              />
            </div>

            {bmi !== null && (
              <div className="md:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-2.5">
                  <span className="text-sm font-medium text-clinical-800">IMC:</span>
                  <span className="text-lg font-bold text-clinical-700">{bmi}</span>
                  <span className="text-sm text-clinical-600">
                    {bmi < 18.5
                      ? 'Bajo peso'
                      : bmi < 25
                        ? 'Normal'
                        : bmi < 30
                          ? 'Sobrepeso'
                          : 'Obesidad'}
                  </span>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="comorbidities" className={labelClass}>
                Comorbilidades
              </label>
              <input
                id="comorbidities"
                type="text"
                value={comorbiditiesText}
                onChange={(e) => setComorbiditiesText(e.target.value)}
                placeholder="Separar con comas: Diabetes, Hipotiroidismo, ..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                Separe cada comorbilidad con una coma
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="medications" className={labelClass}>
                Medicamentos
              </label>
              <input
                id="medications"
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="Separar con comas: Losartan, Metformina, ..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                Separe cada medicamento con una coma
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="family_history" className={labelClass}>
                Antecedentes Familiares
              </label>
              <input
                id="family_history"
                type="text"
                value={familyHistoryText}
                onChange={(e) => setFamilyHistoryText(e.target.value)}
                placeholder="Separar con comas: HTA, Diabetes, ..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                Separe cada antecedente con una coma
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className={labelClass}>
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Observaciones adicionales sobre el paciente..."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientFormPage;
