export interface AnalysisResult {
  product: {
    name: string;
    brand: string;
    category: string;
    country_of_origin: string;
    label_language: string;
  };
  safety_score: number;
  ai_confidence: number;
  recommendation: 'BUY' | 'AVOID' | 'PROCEED WITH CAUTION';
  translation: string;
  dietary_advice: {
    what_to_eat: string;
    what_not_to_eat: string;
    moderation_info: string;
  };
  online_alternatives: string[];
  category_scores: {
    health_safety: number;
    ingredient_transparency: number;
    claim_honesty: number;
    nutritional_value: number;
  };
  ingredients: Ingredient[];
  claims: Claim[];
  warnings: Warning[];
  safety_breakdown: {
    sugar_level: number;
    sodium_level: number;
    preservatives_level: number;
    artificial_additives_level: number;
    allergen_risk: number;
  };
  summary: string[];
  health_note: string;
  alternatives: string[];
  sources: string[];
}

export interface Ingredient {
  original_name: string;
  simplified_name: string;
  function: string;
  health_impact: 'beneficial' | 'neutral' | 'caution' | 'avoid';
  explanation: string;
  detail: string;
  is_flagged: boolean;
  flag_reason?: string;
}

export interface Claim {
  claim_text: string;
  verdict: 'TRUE' | 'MISLEADING' | 'FALSE';
  explanation: string;
}

export interface Warning {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}
