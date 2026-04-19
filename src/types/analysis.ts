export interface AnalysisResult {
  product: {
    name: string;
    brand: string;
    category: string;
    country_of_origin: string;
  };
  safety_score: number;
  recommendation: string;
  translation: string;
  ingredients: Ingredient[];
  alternatives: Alternative[];
  sources: Source[];
  summary: string;
}

export interface Ingredient {
  name: string;
  health_impact: string;
  explanation: string;
}

export interface Alternative {
  name: string;
  quality: string;
  reason: string;
}

export interface Source {
  name: string;
  url: string;
}