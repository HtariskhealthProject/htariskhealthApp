import type { BPCategory } from '../types';
import { DISCLAIMER } from '../utils/classification';

interface Recommendation {
  category: BPCategory;
  title: string;
  actionLevel: string;
  followUp: string;
  lifestyle: string[];
  pharmacological: string[];
  monitoring: string[];
}

const recommendations: Recommendation[] = [
  {
    category: 'normal',
    title: 'Presion Arterial Normal',
    actionLevel: 'Mantenimiento',
    followUp: 'Control anual o segun indicacion clinica',
    lifestyle: [
      'Dieta DASH (frutas, verduras, granos integrales)',
      'Actividad fisica aerobica 150 min/semana',
      'Limitar sodio a <2300 mg/dia',
      'Mantener peso saludable (IMC 18.5-24.9)',
    ],
    pharmacological: ['No se requiere farmacoterapia'],
    monitoring: ['Control anual de presion arterial', 'Perfil lipidico cada 5 anos'],
  },
  {
    category: 'elevated',
    title: 'Presion Arterial Elevada',
    actionLevel: 'Prevencion',
    followUp: 'Reevaluar en 3-6 meses',
    lifestyle: [
      'Dieta DASH estricta',
      'Ejercicio aerobico 150-300 min/semana',
      'Reducir sodio a <1500 mg/dia',
      'Limitar alcohol (<2 tragos/dia hombres, <1 mujeres)',
      'Manejo del estres',
    ],
    pharmacological: [
      'Considerar AAS si riesgo CV elevado',
      'No se requiere antihipertensivo aun',
    ],
    monitoring: ['Control cada 3-6 meses', 'Auto-monitoreo domiciliario semanal'],
  },
  {
    category: 'hta_stage1',
    title: 'Hipertension Arterial Etapa 1',
    actionLevel: 'Tratamiento Inicial',
    followUp: 'Control en 1 mes',
    lifestyle: [
      'Todas las medidas de la etapa elevada',
      'Dieta hiposodica estricta',
      'Perdida de peso si IMC > 25',
      'Cese tabaquico si aplica',
    ],
    pharmacological: [
      'IECA (Enalapril, Lisinopril) o ARA II (Losartan)',
      'O: Calcioantagonistas (Amlodipino)',
      'O: Diureticos tiazidicos (Hidroclorotiazida)',
      'Monoterapia inicial, combinar si no se alcanza meta',
    ],
    monitoring: [
      'Control cada mes hasta meta (<130/80)',
      'Creatinina y potasio a las 2 semanas',
      'Auto-monitoreo domiciliario 2-3 veces/semana',
    ],
  },
  {
    category: 'hta_stage2',
    title: 'Hipertension Arterial Etapa 2',
    actionLevel: 'Tratamiento Intensivo',
    followUp: 'Control en 2-4 semanas',
    lifestyle: [
      'Todas las medidas anteriores',
      'Supervision dietaria profesional',
      'Programa de ejercicio supervisado',
    ],
    pharmacological: [
      'Terapia dual desde el inicio:',
      'IECA/ARA II + Calcioantagonista',
      'O: IECA/ARA II + Diuretico tiazidico',
      'Considerar espironolactona como tercer agente',
    ],
    monitoring: [
      'Control cada 2-4 semanas',
      'Funcion renal y electrolitos cada 2 semanas',
      'Auto-monitoreo domiciliario diario',
      'Evaluacion de dano organico (ECG, fondo de ojo)',
    ],
  },
  {
    category: 'hta_grave',
    title: 'HTA Grave (Urgencia Hipertensiva)',
    actionLevel: 'Manejo Urgente',
    followUp: 'Control en 24-72 horas',
    lifestyle: [
      'Reposo relativo',
      'Ambiente tranquilo',
      'Evitar estimulantes',
    ],
    pharmacological: [
      'Reduccion gradual 25% en primeras 24h',
      'Captopril 25mg sublingual o via oral',
      'Amlodipino 10mg via oral',
      'NO reduccion rapida (riesgo de hipoperfusion)',
    ],
    monitoring: [
      'Control cada 1-2 horas hasta estabilizacion',
      'Monitoreo continuo de PA y FC',
      'Evaluar dano organico objetivo',
      'Hospitalizacion si no mejora en 6h',
    ],
  },
  {
    category: 'hypertensive_crisis',
    title: 'Emergencia Hipertensiva',
    actionLevel: 'EMERGENCIA - UCI',
    followUp: 'Monitoreo continuo en UCI',
    lifestyle: [
      'Reposo absoluto en UCI',
      'Via venosa permeable',
      'Monitorizacion continua',
    ],
    pharmacological: [
      'Reduccion IV inmediata:',
      'Nitroprusiato de sodio IV (0.25-10 mcg/kg/min)',
      'O: Labetalol IV 20-80mg en bolos',
      'O: Nicardipino IV 5-15 mg/h',
      'Objetivo: Reducir 25% en primera hora',
    ],
    monitoring: [
      'Monitoreo continuo en UCI',
      'PA invasiva si es necesario',
      'Evaluacion neurologica serial',
      'Funcion renal, hepatica, cardiaca continua',
      'Imagen cerebral urgente si sintomas neurologicos',
    ],
  },
];

export const RecommendationService = {
  async getAll(): Promise<Recommendation[]> {
    await new Promise((r) => setTimeout(r, 100));
    return recommendations;
  },

  async getByCategory(category: BPCategory): Promise<Recommendation | undefined> {
    await new Promise((r) => setTimeout(r, 50));
    return recommendations.find((r) => r.category === category);
  },

  getDisclaimer(): string {
    return DISCLAIMER;
  },
};
