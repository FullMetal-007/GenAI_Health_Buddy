export interface Medication {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
}

export interface DrugInteraction {
    medicines: string[];
    interaction_level: 'High' | 'Moderate' | 'Low';
    description: string;
}

export interface PrescriptionInfo {
  medications: Medication[];
  precautions: string[];
  vitals?: {
    [key: string]: string;
  };
  drug_interactions: DrugInteraction[];
  lifestyle_and_diet_recos: string[];
  potential_conditions_summary: string;
}

export interface MedicineInfo {
  name: string;
  uses: string[];
  dosage: string;
  side_effects: string[];
  precautions: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface SymptomInfo {
    disclaimer: string;
    summary: string;
    possible_conditions: Array<{
        name: string;
        description: string;
    }>;
    advice: string[];
    urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
}

export type ViewState = 'welcome' | 'prescription' | 'medicine' | 'interaction' | 'symptom' | 'comparison';