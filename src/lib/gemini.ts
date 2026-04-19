import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types/analysis';

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in environment variables.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzeProduct(
  imageBase64: string,
  mediaType: string,
  userLanguage: string = 'English'
): Promise<AnalysisResult> {
  if (!apiKey) {
      throw new Error('API Key is missing. Check Vercel Environment Variables.');
  }

  const systemInstruction = `You are TruthScan AI, an expert product safety analyst. 
Analyze the packaged product image and provide a JSON response.
All text must be in ${userLanguage} language.`;

  const userPrompt = `Analyze this product image completely. Identify its category and provide detailed safety, quality, and ingredient analysis. Provide a total assessment.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: userPrompt }
        ]
      },
      config: {
        // 🔴 CRITICAL FIX 1: Removed Google Search & Thinking features which break free-tier keys
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                category: { type: Type.STRING },
                country_of_origin: { type: Type.STRING },
                label_language: { type: Type.STRING }
              },
              required: ["name", "brand", "category", "country_of_origin", "label_language"]
            },
            safety_score: { type: Type.INTEGER },
            ai_confidence: { type: Type.INTEGER },
            recommendation: { type: Type.STRING },
            translation: { type: Type.STRING },
            dietary_advice: {
              type: Type.OBJECT,
              properties: {
                what_to_eat: { type: Type.STRING },
                what_not_to_eat: { type: Type.STRING },
                moderation_info: { type: Type.STRING }
              },
              required: ["what_to_eat", "what_not_to_eat", "moderation_info"]
            },
            online_alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                  function: { type: Type.STRING },
                  health_impact: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  is_flagged: { type: Type.BOOLEAN },
                  flag_reason: { type: Type.STRING }
                },
                required: ["original_name", "simplified_name", "function", "health_impact", "explanation", "detail", "is_flagged"]
              }
            },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim_text: { type: Type.STRING },
                  verdict: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["claim_text", "verdict", "explanation"]
              }
            },
            warnings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  message: { type: Type.STRING }
                },
                required: ["type", "severity", "message"]
              }
            },
            safety_breakdown: {
              type: Type.OBJECT,
              properties: {
                sugar_level: { type: Type.INTEGER },
                sodium_level: { type: Type.INTEGER },
                preservatives_level: { type: Type.INTEGER },
                artificial_additives_level: { type: Type.INTEGER },
                allergen_risk: { type: Type.INTEGER }
              },
              required: ["sugar_level", "sodium_level", "preservatives_level", "artificial_additives_level", "allergen_risk"]
            },
            summary: { type: Type.ARRAY, items: { type: Type.STRING } },
            health_note: { type: Type.STRING },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["product", "safety_score", "ai_confidence", "recommendation", "translation", "dietary_advice", "online_alternatives", "category_scores", "ingredients", "claims", "warnings", "safety_breakdown", "summary", "health_note", "alternatives", "sources"]
        }
      }
    });

    let text = response.text;
    if (text) {
      // 🔴 CRITICAL FIX 2: Strip completely invisible formatting that breaks JSON.parse
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text) as AnalysisResult;
    }
    throw new Error('Received empty response from the AI.');
  } catch (error: any) {
    console.error('Gemini API Error details:', error);
    // 🔴 CRITICAL FIX 3: Actually capture the real error message for the UI!
    throw new Error(error.message || 'Unknown Gemini API connection error.');
  }
}