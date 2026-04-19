import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { AnalysisResult } from '../types/analysis';

// Type augmentation for Vite environment variables
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }
}

// 1. Retrieve the API key securely from Vite's environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("🤖 CRITICAL: VITE_GEMINI_API_KEY is missing from environment variables.");
  throw new Error("Missing Gemini API key");
}

// 2. Initialize the AI Client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzeProduct(
  imageBase64: string,
  mediaType: string,
  userLanguage: string = 'English'
): Promise<AnalysisResult> {
  if (!apiKey) {
      throw new Error("Missing Gemini API key");
  }

  const systemInstruction = `You are TruthScan AI, an expert, multi-disciplinary product safety and quality analyst. 
Your job is to analyze packaged product images (food, skincare, electronics, household items, cosmetics, etc.) and provide detailed, accurate analysis in a concise format.

RULES:
1. Identify the product from the image (brand, name, category, country).
2. Read ALL text visible on the label, including ingredients (for food/cosmetics) or materials/components (for others), functional claims, and usage instructions.
3. Use web search to verify the product's safety, materials, and marketing claims.
4. Analyze components: what they are, their function, and safety impact. Keep explanations short and factual.
5. Verify EVERY marketing claim on the packaging against facts.
6. Calculate a REAL, dynamic Safety & Quality Score (0-100). Do NOT provide static scores. Use penalties for harmful chemicals, deceptive marketing, poor material quality, or false claims.
7. Be honest - if a claim is misleading, say so clearly. Use step-by-step points.
8. Use simple language.
9. All text fields in your response MUST be in ${userLanguage} language.
10. Provide actual, clickable, direct 'https://...' URLs in 'sources' from credible/regulatory sites (FDA, EFSA, manufacturer official site, etc.).
11. If a product is genuinely unsafe or low quality, provide genuinely safer and higher quality AND available alternatives. If a product is excellent, do NOT invent issues; just confirm its quality.
12. If no ingredient/material list is found, clearly state that as a limitation in the result, but still analyze the product as best as possible based on the brand reputation and available online information.`;

  const userPrompt = `Analyze this product image completely. Search the web for more information. Identify its category (food, skincare, electronic, etc.). Based on its category, provide a detailed safety, quality, and ingredient/material analysis. Provide a total assessment.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: userPrompt }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: {
              type: Type.OBJECT,
              description: "Product Identity Details",
              properties: {
                name: { type: Type.STRING, description: "product name" },
                brand: { type: Type.STRING, description: "brand/manufacturer name" },
                category: { type: Type.STRING, description: "product category (e.g., Food, Skincare, Electronic, household)" },
                country_of_origin: { type: Type.STRING, description: "country where made" },
                label_language: { type: Type.STRING, description: "detected language of label" }
              },
              required: ["name", "brand", "category", "country_of_origin", "label_language"]
            },
            safety_score: { type: Type.INTEGER, description: "0-100 (100 is best)" },
            ai_confidence: { type: Type.INTEGER, description: "0-100 — how confident you are in this analysis" },
            recommendation: { type: Type.STRING, description: "BUY, AVOID, or PROCEED WITH CAUTION" },
            translation: { type: Type.STRING, description: `Translate all important label text (instructions, warnings, benefits) into ${userLanguage}` },
            dietary_advice: {
              type: Type.OBJECT,
              description: "Contextual advice: For food, use dietary advice. For others, use usage/safety best practices.",
              properties: {
                what_to_eat: { type: Type.STRING, description: "If food: suggest consuming. Otherwise: suggest best usage practices." },
                what_not_to_eat: { type: Type.STRING, description: "If food: suggest avoiding. Otherwise: suggest what to avoid/risks." },
                moderation_info: { type: Type.STRING, description: "Moderation or safety handling info." }
              },
              required: ["what_to_eat", "what_not_to_eat", "moderation_info"]
            },
            online_alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggest 3 real, healthier/better alternative products available online"
            },
            category_scores: {
              type: Type.OBJECT,
              properties: {
                health_safety: { type: Type.INTEGER },
                ingredient_transparency: { type: Type.INTEGER },
                claim_honesty: { type: Type.INTEGER },
                nutritional_value: { type: Type.INTEGER }
              },
              required: ["health_safety", "ingredient_transparency", "claim_honesty", "nutritional_value"]
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original_name: { type: Type.STRING },
                  simplified_name: { type: Type.STRING },
                  function: { type: Type.STRING, description: "what it does (Preservative, Active Ingredient, Component Material, etc.)" },
                  health_impact: { type: Type.STRING, description: "beneficial, neutral, caution, or avoid" },
                  explanation: { type: Type.STRING, description: "1-2 sentence plain language explanation" },
                  detail: { type: Type.STRING, description: "more detailed scientific explanation for expanded view" },
                  is_flagged: { type: Type.BOOLEAN, description: "true if this is a concerning ingredient" },
                  flag_reason: { type: Type.STRING, description: "only if is_flagged is true" }
                },
                required: ["original_name", "simplified_name", "function", "health_impact", "explanation", "detail", "is_flagged"]
              }
            },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim_text: { type: Type.STRING, description: "exact claim as written on packaging" },
                  verdict: { type: Type.STRING, description: "TRUE, MISLEADING, or FALSE" },
                  explanation: { type: Type.STRING, description: "1-2 sentence explanation of verdict" }
                },
                required: ["claim_text", "verdict", "explanation"]
              }
            },
            warnings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "e.g., High Sugar, Excess Sodium, Harmful Preservatives" },
                  severity: { type: Type.STRING, description: "low, medium, or high" },
                  message: { type: Type.STRING, description: "brief warning message" }
                },
                required: ["type", "severity", "message"]
              }
            },
            safety_breakdown: {
              type: Type.OBJECT,
              properties: {
                sugar_level: { type: Type.INTEGER, description: "0-100 (100 = very high)" },
                sodium_level: { type: Type.INTEGER, description: "0-100" },
                preservatives_level: { type: Type.INTEGER, description: "0-100" },
                artificial_additives_level: { type: Type.INTEGER, description: "0-100" },
                allergen_risk: { type: Type.INTEGER, description: "0-100" }
              },
              required: ["sugar_level", "sodium_level", "preservatives_level", "artificial_additives_level", "allergen_risk"]
            },
            summary: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            health_note: { type: Type.STRING, description: "2 sentence why this matters for health" },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "product",
            "safety_score",
            "ai_confidence",
            "recommendation",
            "translation",
            "dietary_advice",
            "online_alternatives",
            "category_scores",
            "ingredients",
            "claims",
            "warnings",
            "safety_breakdown",
            "summary",
            "health_note",
            "alternatives",
            "sources"
          ]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AnalysisResult;
    }
    throw new Error('No valid response received.');
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("AI failed to analyze image");
  }
}