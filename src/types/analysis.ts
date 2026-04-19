export interface AnalysisResult {
  error?: string;
  product: {
    name: string;
    brand: string;
    category: string;
    country_of_origin: string;
  };
  product_category: string;
  safety_score: number;
  ai_confidence: number;
  category_scores?: {
    health_safety: number;
    ingredient_transparency: number;
    claim_honesty: number;
    nutritional_value: number;
  };
  recommendation: string;
  translation?: string;
  summary: string[];
  health_note?: string;
  usage_and_safety_guidelines?: {
    // Food/Drink fields
    what_to_eat?: string;
    what_not_to_eat?: string;
    caution_warnings?: string;
    // Cosmetic fields
    skin_safety?: string;
    allergy_risks?: string;
    proper_usage?: string;
    // Household chemical fields
    handling_safety?: string;
    storage_requirements?: string;
    disposal_info?: string;
    // Other/general fields
    general_safety?: string;
    material_warnings?: string;
    environmental_impact?: string;
  };
  online_alternatives?: string[];
  claims?: Claim[];
  components_or_ingredients?: ComponentOrIngredient[];
  safety_breakdown: {
    sugar_level: number;
    sodium_level: number;
    preservatives_level: number;
    artificial_additives_level: number;
    allergen_risk: number;
  };
  warnings?: Warning[];
  sources: string[];
  dynamic_data_statement?: string;
}

export interface Claim {
  claim_text: string;
  verdict: string;
  explanation: string;
}

export interface Warning {
  type: string;
  severity: string;
  message: string;
}

export interface ComponentOrIngredient {
  simplified_name: string;
  original_name: string;
  function: string;
  health_impact: string;
  explanation: string;
  detail?: string;
  is_flagged?: boolean;
  flag_reason?: string;
}