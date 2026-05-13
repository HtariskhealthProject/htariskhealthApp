import { useState, useEffect } from 'react';
import { RecommendationService } from '../../services/RecommendationService';
import type { BPCategory } from '../../types';
import { DISCLAIMER } from '../../utils/classification';
import {
  Lightbulb,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader';
import ClinicalAlert from '../../components/ui/ClinicalAlert';
import RecommendationCard from '../../components/ui/RecommendationCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Recommendation {
  category: BPCategory;
  title: string;
  actionLevel: string;
  followUp: string;
  lifestyle: string[];
  pharmacological: string[];
  monitoring: string[];
}

const CATEGORY_COLORS: Record<BPCategory, string> = {
  normal: '#16a34a',
  elevated: '#ca8a04',
  hta_stage1: '#ea580c',
  hta_stage2: '#dc2626',
  hta_grave: '#991b1b',
  hypertensive_crisis: '#7f1d1d',
};

const BP_RANGES: {
  category: BPCategory;
  label: string;
  systolic: string;
  diastolic: string;
}[] = [
  {
    category: 'normal',
    label: 'Normal',
    systolic: '<120',
    diastolic: '<80',
  },
  {
    category: 'elevated',
    label: 'Elevada',
    systolic: '120-129',
    diastolic: '<80',
  },
  {
    category: 'hta_stage1',
    label: 'HTA Etapa 1',
    systolic: '130-139',
    diastolic: '80-89',
  },
  {
    category: 'hta_stage2',
    label: 'HTA Etapa 2',
    systolic: '\u2265140',
    diastolic: '\u226590',
  },
  {
    category: 'hta_grave',
    label: 'HTA Grave',
    systolic: '>180',
    diastolic: '>120',
  },
  {
    category: 'hypertensive_crisis',
    label: 'Emergencia Hipertensiva',
    systolic: '>180',
    diastolic: '>120',
  },
];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        const data = await RecommendationService.getAll();
        setRecommendations(data);
      } catch (err) {
        setError('Error al cargar las recomendaciones clinicas.');
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ClinicalAlert level="danger" title="Error">
          {error}
        </ClinicalAlert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Recomendaciones Clinicas"
        subtitle="Guias de manejo basadas en clasificacion AHA/ACC 2025"
        icon={<Lightbulb className="w-5 h-5" />}
      />

      {/* Disclaimer Banner */}
      <ClinicalAlert level="warning" title="Aviso Importante">
        {DISCLAIMER}
      </ClinicalAlert>

      {/* AHA 2025 Classification Rules Grid */}
      <SectionCard
        title="Clasificacion AHA/ACC 2025"
        subtitle="Rangos de presion arterial por categoria"
        icon={<ClipboardList className="w-4 h-4" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BP_RANGES.map((range) => (
            <div
              key={range.category}
              className="rounded-lg border border-slate-200 bg-white p-3 text-center"
            >
              <StatusBadge category={range.category} size="sm" />
              <div className="mt-2 space-y-1">
                <p
                  className="text-lg font-bold text-slate-800"
                >
                  {range.systolic}
                </p>
                <p className="text-xs text-slate-500">/ {range.diastolic} mmHg</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recommendation Cards (Accordion) */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-clinical-600" />
          Recomendaciones por Categoria
        </h2>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.category}
              title={rec.title}
              color={CATEGORY_COLORS[rec.category]}
              actionLevel={rec.actionLevel}
              followUp={rec.followUp}
              lifestyle={rec.lifestyle}
              pharmacological={rec.pharmacological}
              monitoring={rec.monitoring}
              defaultOpen={rec.category === 'hypertensive_crisis'}
            />
          ))}
        </div>
      </section>

      {/* Bottom Disclaimer */}
      <ClinicalAlert level="warning" title="Aviso Importante">
        Estas recomendaciones son de caracter general y no reemplazan el criterio medico ni los protocolos institucionales.
      </ClinicalAlert>
    </div>
  );
}
