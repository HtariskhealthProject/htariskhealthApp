import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { ReadingHistoryService } from '../../services/ReadingHistoryService';
import type { Patient, BloodPressureReading, BPCategory } from '../../types';
import { Users, Plus, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import PatientSummaryCard from '../../components/ui/PatientSummaryCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import FilterBar from '../../components/ui/FilterBar';

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, readingsData] = await Promise.all([
          PatientService.getAll(),
          ReadingHistoryService.getAll(),
        ]);
        setPatients(patientsData);
        setReadings(readingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLatestCategoryForPatient = (patientId: string): BPCategory | undefined => {
    const patientReadings = readings.filter((r) => r.patient_id === patientId);
    if (patientReadings.length === 0) return undefined;
    return patientReadings[0].category;
  };

  const getLatestBPForPatient = (patientId: string): string | undefined => {
    const patientReadings = readings.filter((r) => r.patient_id === patientId);
    if (patientReadings.length === 0) return undefined;
    const latest = patientReadings[0];
    return `${latest.systolic}/${latest.diastolic}`;
  };

  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    return (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(term) ||
      patient.document_number?.toLowerCase().includes(term) ||
      patient.city?.toLowerCase().includes(term) ||
      patient.eps?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Cargando pacientes...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        subtitle="Gestion de pacientes del programa HTA"
        icon={<Users className="h-5 w-5" />}
        actions={
          <Link
            to="/patients/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Link>
        }
      />

      <FilterBar>
        <FilterBar.Item label="Buscar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nombre, documento, ciudad o EPS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500"
            />
          </div>
        </FilterBar.Item>
      </FilterBar>

      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No se encontraron pacientes"
          description={
            searchTerm
              ? 'Intenta ajustar los terminos de busqueda'
              : 'Agrega el primer paciente al programa HTA'
          }
          action={
            !searchTerm ? (
              <Link
                to="/patients/new"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Paciente
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Ciudad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    EPS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    IMC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Registro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const latestCategory = getLatestCategoryForPatient(patient.id);
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="font-medium text-clinical-700 hover:text-clinical-900 hover:underline"
                          >
                            {patient.first_name} {patient.last_name}
                          </Link>
                          {latestCategory && <StatusBadge category={latestCategory} size="sm" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{patient.document_number}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{patient.city}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{patient.eps}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{patient.bmi}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(patient.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredPatients.map((patient) => (
              <Link key={patient.id} to={`/patients/${patient.id}`} className="block">
                <PatientSummaryCard
                  patient={patient}
                  latestCategory={getLatestCategoryForPatient(patient.id)}
                  latestBP={getLatestBPForPatient(patient.id)}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientsPage;
