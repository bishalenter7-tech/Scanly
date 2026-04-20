import { GoogleGenAI, Type } from '@google/genai';

const apiKey = (import.meta.env as any).VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzeProduct(
  imageBase64: string,
  mediaType: string,
  userLanguage: string = 'English'
) {
  if (!apiKey) throw new Error('API Key is missing.');

 const systemInstruction = `You are Scanly - a universal product safety analyst app. Your goal is to help ANY user understand ANY product simply.

PRE-PROCESSING RULE:
Analyze the product from the image and determine its type:
- If it's something you consume (food, drink, medicine): Use FOOD_DRINK category
- If it's for external use on body/skin (cream, shampoo, lotion, perfume): Use COSMETIC_SKINCARE category  
- If it's for cleaning/household (detergent, floor cleaner, pesticide): Use HOUSEHOLD_CHEMICAL category
- For everything else (toys, electronics, clothing, etc.): Use OTHER category

SIMPLE LANGUAGE REQUIREMENTS (CRITICAL):
- Use everyday simple words. Avoid complex jargon.
- When you MUST use a technical term, briefly explain it in simple words right after.
- Example: "Hyaluronic acid (a hydration-boosting ingredient)" - the part in parentheses explains simply.
- Keep all explanations short: 1-2 sentences maximum per point.
- Use bullet points for lists.

UNIVERSAL SAFETY FORMAT (use appropriate fields based on category):
- FOOD_DRINK: what_to_eat (good), what_not_to_eat (bad), caution_warnings
- COSMETIC_SKINCARE: skin_safety (safe for skin?), allergy_risks (watch for), proper_usage
- HOUSEHOLD_CHEMICAL: handling_safety, storage_requirements, disposal_info
- OTHER: general_safety, material_warnings, environmental_impact

DYNAMIC DATA:
- Always fetch safety data from the internet based on the actual product/ingredients shown.
- If safety data is unavailable for a specific ingredient, state "Not enough safety data found for this ingredient."

STRICT SCORING RULES (CRITICAL - FOLLOW EXACTLY):
1. SAFETY_SCORE SCALE (0-100):
   - 0 = Completely safe, no concerns
   - 1-20 = Generally safe, minor concerns
   - 21-40 = Moderate concerns, some risky ingredients
   - 41-70 = Significant concerns, many risky ingredients
   - 71-90 = High risk, many harmful ingredients
   - 91-100 = Extremely dangerous, toxic ingredients

2. ULTRA-PROCESSED FOODS (Kurkure, Doritos, Lays, chips, instant noodles, soda, candy, etc.):
   - These MUST receive a safety_score between 20-40 (never above 40)
   - The recommendation MUST be "AVOID" for ultra-processed junk foods
   - Do NOT give these products high scores under any circumstances

3. SAFETY_BREAKDOWN SCALE (0-100 - VERY IMPORTANT):
   - This scale is REVERSED from normal thinking: 0 = NONE/SAFE, 100 = EXTREMELY HIGH/DANGEROUS
   - sugar_level: 0 = no sugar, 100 = extremely high sugar (harmful levels)
   - sodium_level: 0 = no sodium, 100 = dangerously high sodium (above daily limit)
   - preservatives_level: 0 = no preservatives, 100 = excessive dangerous preservatives
   - artificial_additives_level: 0 = no artificial additives, 100 = many harmful artificial additives
   - allergen_risk: 0 = no allergen risk, 100 = extremely high allergen risk
   - IF a product has high sodium, the sodium_level MUST be 70-100, do NOT output low numbers like 4.
   - Always read nutrition labels and ingredient lists to assign accurate levels.

4. CATEGORY_SCORES (0-100):
   - health_safety: Based on overall health impact (higher = safer)
   - ingredient_transparency: How clearly ingredients are listed (higher = more transparent)
   - claim_honesty: How truthful marketing claims are (higher = more honest)
   - nutritional_value: Nutritional benefits (higher = more nutritious)

LANGUAGE: NATIVE GENERATION RULE:
- NATIVELY generate the entire response in the selected userLanguage.
- Do NOT generate English first and then translate.
- Write all text fields directly in ${userLanguage} from the start.

SOURCES - FULL URLs REQUIRED (CRITICAL):
- Under 'sources', you MUST provide valid FULL URLs starting with https://
- Examples of GOOD URLs:
  * 'https://world.openfoodfacts.org/product/123456' (actual product page)
  * 'https://pubmed.ncbi.nlm.nih.gov/?term=product+ingredient+safety'
  * 'https://scholar.google.com/scholar?q=ingredient+health+effects'
  * 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=Brand+Name+Product'
- If you cannot find a specific article, dynamically generate a reliable search URL as shown above.
- NEVER return plain domains like 'who.int' or 'fda.gov' - they must be full URLs.
- Return empty array only if absolutely no sources can be constructed.

BRANDING: Always sign as "Scanly Analysis".

Return pure JSON following the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: "Analyze this product and explain it in SIMPLE language. Use bullet points. Show what's good and what's concerning." }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            error: { type: Type.STRING },
            product: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, brand: { type: Type.STRING }, category: { type: Type.STRING }, country_of_origin: { type: Type.STRING } } },
            product_category: { type: Type.STRING, description: "FOOD_DRINK, COSMETIC_SKINCARE, HOUSEHOLD_CHEMICAL, or OTHER" },
            recommendation: { type: Type.STRING, description: "BUY, AVOID, or CAUTION" },
            ai_confidence: { type: Type.INTEGER },
            safety_score: { type: Type.INTEGER },
            dynamic_data_statement: { type: Type.STRING },
            summary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Simple bullet points - what's good and what's bad" },
            health_note: { type: Type.STRING, description: "Simple one-line health note" },
            translation: { type: Type.STRING },
            usage_and_safety_guidelines: { type: Type.OBJECT, properties: { 
              what_to_eat: { type: Type.STRING }, 
              what_not_to_eat: { type: Type.STRING }, 
              caution_warnings: { type: Type.STRING },
              skin_safety: { type: Type.STRING },
              allergy_risks: { type: Type.STRING },
              proper_usage: { type: Type.STRING },
              handling_safety: { type: Type.STRING },
              storage_requirements: { type: Type.STRING },
              disposal_info: { type: Type.STRING },
              general_safety: { type: Type.STRING },
              material_warnings: { type: Type.STRING },
              environmental_impact: { type: Type.STRING }
            }, description: "Universal safety guidelines - use relevant fields based on category" },
            online_alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Healthy alternatives for FOOD_DRINK only" },
            claims: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { claim_text: { type: Type.STRING }, verdict: { type: Type.STRING }, explanation: { type: Type.STRING } } } },
            components_or_ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { simplified_name: { type: Type.STRING }, original_name: { type: Type.STRING }, function: { type: Type.STRING }, health_impact: { type: Type.STRING }, explanation: { type: Type.STRING }, detail: { type: Type.STRING }, is_flagged: { type: Type.BOOLEAN }, flag_reason: { type: Type.STRING } } } },
            safety_breakdown: { type: Type.OBJECT, properties: { sugar_level: { type: Type.INTEGER }, sodium_level: { type: Type.INTEGER }, preservatives_level: { type: Type.INTEGER }, artificial_additives_level: { type: Type.INTEGER }, allergen_risk: { type: Type.INTEGER } } },
            warnings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, severity: { type: Type.STRING }, message: { type: Type.STRING } } } },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["product", "product_category", "recommendation", "ai_confidence", "safety_score", "summary", "components_or_ingredients", "safety_breakdown", "sources"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return parsedData;

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    const errorMessage = error?.message || '';
    const errorString = JSON.stringify(error);
    
    // Handle 503 "high demand" errors gracefully
    if (errorString.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('rate limit')) {
      const friendlyError = new Error('⏳ AI Servers are currently experiencing high traffic. Please tap Analyze to try again in a few seconds.');
      friendlyError.name = 'HIGH_DEMAND';
      throw friendlyError;
    }
    
    // Handle other API errors
    if (errorMessage.includes('API') || errorString.includes('api')) {
      const friendlyError = new Error('AI service temporarily unavailable. Please try again.');
      friendlyError.name = 'API_ERROR';
      throw friendlyError;
    }
    
    throw error;
  }
}