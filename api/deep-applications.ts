import { GoogleGenAI, Type } from "@google/genai";
import type { AlloyResult, Language, DeepApplication } from "../types";
import { GEMINI_MODEL } from "../constants";

export const config = {
  maxDuration: 60,
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
    const { alloyResult, language } = await req.json();

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
        tools: [{ googleSearch: {} }], // Enable grounding
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
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("Deep App Analysis Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
