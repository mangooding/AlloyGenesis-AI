import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL = 'gemini-2.5-flash';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { requirements, language } = req.body;

    const langInstruction = language === 'zh' 
      ? "Respond strictly in Simplified Chinese." 
      : "Respond strictly in English.";

    const systemPrompt = `
      You are a world-class metallurgist and materials scientist AI. 
      Your goal is to design a metal alloy composition based on specific user requirements.
      ${langInstruction}
      
      You need to:
      1. Determine the optimal base metal based on requirements.
      2. **Generate a cool, futuristic, stylish, and powerful code name/trade name** for this alloy (e.g., "VoidSteel", "TitanFury", "StarForged", "DragonScale"). This name should be evocative and marketing-ready.
      3. Calculate a realistic percentage composition. Sum must be exactly 100%.
      4. Analyze physical properties (Hardness, Flexibility, etc.).
      5. **Detailed Mass Production Feasibility**: Analyze production complexity, challenges, and environmental impact.
      6. **Manufacturing Process**: Provide a step-by-step preparation flow (e.g., melting, casting, heat treatment) with critical parameters (temperature, time) and a list of specific recommended equipment.
      7. **Historical Data**: Search your knowledge base for existing real-world alloys that are similar to this new design.
      8. **Detailed Cost Analysis**: Base cost, bulk pricing, and cost breakdowns.
      
      Constraints:
      - 'properties.value' must be 0-100 normalized.
      - 'feasibility.score' must be 0-100.
    `;

    const userPrompt = `
      Design an alloy with the following requirements:
      - Hardness Priority (0-100): ${requirements.targetHardness}
      - Flexibility/Ductility Priority (0-100): ${requirements.targetFlexibility}
      - Corrosion Resistance Priority (0-100): ${requirements.targetCorrosionResistance}
      - Heat Resistance Priority (0-100): ${requirements.targetHeatResistance}
      - Weight Preference (0-100, higher is heavier): ${requirements.targetWeight}
      - Cost Constraint: ${requirements.costConstraint}
      - Context: ${requirements.applicationContext || "General Purpose"}
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alloyName: { type: Type.STRING },
            codeName: { type: Type.STRING },
            description: { type: Type.STRING },
            composition: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  percentage: { type: Type.NUMBER },
                  role: { type: Type.STRING }
                },
                required: ["element", "percentage", "role"]
              }
            },
            properties: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  predictedValue: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "value", "unit", "predictedValue", "description"]
              }
            },
            feasibility: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                level: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                productionComplexity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                equipmentRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                environmentalImpact: { type: Type.STRING },
                challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["score", "level", "productionComplexity", "equipmentRequirements", "environmentalImpact", "challenges", "recommendations"]
            },
            manufacturing: {
              type: Type.OBJECT,
              properties: {
                method: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.STRING },
                      details: { type: Type.STRING }
                    },
                    required: ["step", "details"]
                  }
                },
                specificEquipment: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["method", "steps", "specificEquipment"]
            },
            costAnalysis: {
              type: Type.OBJECT,
              properties: {
                estimatedCostPerKg: { type: Type.STRING },
                marketAvailability: { type: Type.STRING, enum: ["Common", "Rare", "Exotic"] },
                expensiveComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
                materialCostBreakdown: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: { item: { type: Type.STRING }, percentage: { type: Type.NUMBER } },
                    required: ["item", "percentage"]
                  } 
                },
                manufacturingCostBreakdown: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: { item: { type: Type.STRING }, percentage: { type: Type.NUMBER } },
                    required: ["item", "percentage"]
                  } 
                },
                bulkPricing: {
                  type: Type.OBJECT,
                  properties: { minOrderQuantity: { type: Type.STRING }, estimatedPriceRange: { type: Type.STRING } },
                  required: ["minOrderQuantity", "estimatedPriceRange"]
                },
                notes: { type: Type.STRING }
              },
              required: ["estimatedCostPerKg", "marketAvailability", "expensiveComponents", "materialCostBreakdown", "manufacturingCostBreakdown", "bulkPricing", "notes"]
            },
            applications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            similarAlloys: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  compositionSummary: { type: Type.STRING },
                  application: { type: Type.STRING },
                  similarityNote: { type: Type.STRING }
                }
              }
            }
          },
          required: ["alloyName", "codeName", "description", "composition", "properties", "feasibility", "manufacturing", "costAnalysis", "applications", "similarAlloys"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
