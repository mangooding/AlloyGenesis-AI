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
    const { marketInput, language } = req.body;

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
        tools: [{ googleSearch: {} }],
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
    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Market Analysis Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
