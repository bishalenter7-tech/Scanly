import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types/analysis';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzeProduct(
  imageBase64: string,
  mediaType: string,
  userLanguage: string = 'English'
): Promise<AnalysisResult> {
  if (!apiKey) throw new Error('API Key is missing.');

  // Branding fixed to "Scanly"
  // AI is now strictly forbidden from suggesting high-sugar/unhealthy alternatives
  const systemInstruction = `You are Scanly AI, a highly accurate, critical product safety and health analyst.
  
  RULES FOR ACCURACY:
  1. Branding: Always refer to yourself as "Scanly".
  2. Language: All output must be in ${userLanguage}.
  3. Alternatives Safety: NEVER suggest high-sugar health drinks (e.g., Horlicks, Bournvita, Boost) or age-inappropriate shakes (Ensure) as healthy alternatives. Suggest REAL whole-food alternatives (e.g., oats, nuts, protein-rich whole foods, home-made snacks). Evaluate alternatives for actual nutritional quality (low sugar, high protein).
  4. Sources: MUST provide 3-4 actual, verifiable, HTTPS URLs (e.g., FDA/EFSA/clinical study) for the product or ingredient information. Do not fake URLs.
  5. Translation: Translate packaging text accurately.
  6. Score Dynamically: Score based on the ingredient list detected. If ingredients are missing, state that clearly and penalize the transparency score.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast and Free-tier friendly
      contents: {
        parts: [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: "Analyze the product in the image. Return structured JSON." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, brand: { type: Type.STRING }, category: { type: Type.STRING }, country_of_origin: { type: Type.STRING }}, required: ["name", "brand", "category", "country_of_origin"]},
            safety_score: { type: Type.INTEGER },
            recommendation: { type: Type.STRING },
            translation: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, health_impact: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["name", "health_impact", "explanation"] } },
            alternatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quality: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["name", "quality", "reason"] } },
            sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, url: { type: Type.STRING } }, required: ["name", "url"] } },
            summary: { type: Type.STRING } // Summary of the "Scanly" Analysis
          },
          required: ["product", "safety_score", "recommendation", "ingredients", "alternatives", "sources", "summary"]
        }
      }
    });

    const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}