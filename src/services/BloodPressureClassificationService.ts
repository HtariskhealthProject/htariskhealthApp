import type { BloodPressureReadingFormData, BloodPressureReading, ClassificationResult } from '../types';
import { classifyBloodPressure, calculateMeanArterialPressure } from '../utils/classification';

export const BloodPressureClassificationService = {
  classify(formData: BloodPressureReadingFormData): ClassificationResult {
    return classifyBloodPressure(formData.systolic, formData.diastolic, formData.alarm_symptoms);
  },

  classifyAndEnrich(
    formData: BloodPressureReadingFormData,
    userId: string
  ): Omit<BloodPressureReading, 'id' | 'created_at'> {
    const classification = classifyBloodPressure(
      formData.systolic,
      formData.diastolic,
      formData.alarm_symptoms
    );
    return {
      ...formData,
      user_id: userId,
      mean_arterial_pressure: calculateMeanArterialPressure(formData.systolic, formData.diastolic),
      category: classification.category,
      risk_level: classification.riskLevel,
    };
  },
};
