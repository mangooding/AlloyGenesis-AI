import { GoogleGenAI, Type } from "@google/genai";
import type { UserRequirements, Language } from "../types";
import { GEMINI_MODEL } from "../constants";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }), { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { marketInput, language } = await req.json();

    const langInstruction = language === 'zh' 
      ? "Analyze strictly in context of Chinese and Global markets." 
      : "Analyze in context of Global markets.";

    const systemPrompt = `
      You are an expert industrial analyst. Your goal is to translate a text description of a market need or product requirement into technical metallurgical parameters (0-100 integers).
      
      You MUST use Google Search to verify current industry standards for the requested application.
      ${langInstruction}

      Return a JSON object matching the UserRequirements structure.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze this market demand and provide metallurgical requirements: "${marketInput}"`,
      config: {
        tools: [{ googleSearch: {} }], // Enable grounding
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetHardness: { type: Type.INTEGER },
            targetFlexibility: { type: Type.INTEGER },
            targetCorrosionResistance: { type: Type.INTEGER },
            targetHeatResistance: { type: Type.INTEGER },
            targetWeight: { type: Type.INTEGER },
            costConstraint: { type: Type.STRING, enum: ['Budget', 'Standard', 'Premium'] },
            applicationContext: { type: Type.STRING }
          },
          required: ["targetHardness", "targetFlexibility", "targetCorrosionResistance", "targetHeatResistance", "targetWeight", "costConstraint", "applicationContext"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("Market Analysis Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
