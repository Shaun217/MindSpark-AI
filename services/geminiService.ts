import { GoogleGenAI } from "@google/genai";
import { Persona } from "../types";

const PERSONA_PROMPTS: Record<Persona, string> = {
  [Persona.STANDARD]: "You are a helpful AI assistant. Be concise and clear.",
  [Persona.ACADEMIC]: "You are an academic researcher. Use formal, precise language and cite concepts where applicable.",
  [Persona.MARKETER]: "You are a marketing expert. Focus on value propositions, persuasive copy, and punchy delivery.",
  [Persona.CODER]: "You are a senior software engineer. Provide code snippets, technical explanations, and focus on best practices.",
  [Persona.ELI5]: "You are a teacher for young students. Explain complex topics simply using analogies."
};

export const generateGeminiResponse = async (
  apiKey: string,
  prompt: string,
  persona: Persona,
  context?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Construct the full system instruction
  const systemInstruction = `${PERSONA_PROMPTS[persona]} 
  
  Format your response in Markdown. 
  If the user provides context, strictly use that context to answer.`;

  const finalPrompt = context 
    ? `Context:\n${context}\n\nUser Request: ${prompt}`
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using Flash as requested for speed/efficiency
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key")) {
        throw new Error("Invalid API Key. Please check your settings.");
    }
    throw new Error("Failed to reach Gemini. Please check your connection.");
  }
};
