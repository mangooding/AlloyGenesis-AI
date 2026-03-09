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
    const { alloyResult, language } = req.body;

    const langInstruction = language === 'zh' 
      ? "Respond strictly in Simplified Chinese." 
      : "Respond strictly in English.";

    const systemPrompt = `
      You are a commercial material application specialist. 
      Analyze the provided alloy composition and properties.
      Search the internet for modern industries and specific products that require these exact characteristics.
      Provide highly specific application suggestions.
      ${langInstruction}
    `;

    const userPrompt = `
      Alloy Name: ${alloyResult.alloyName}
      Composition: ${JSON.stringify(alloyResult.composition)}
      Properties: ${JSON.stringify(alloyResult.properties)}
      Description: ${alloyResult.description}
      
      Find 3-4 specific, high-value applications.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              industry: { type: Type.STRING },
              specificProduct: { type: Type.STRING },
              reason: { type: Type.STRING },
              marketPotential: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
            },
            required: ["industry", "specificProduct", "reason", "marketPotential"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Deep App Analysis Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
