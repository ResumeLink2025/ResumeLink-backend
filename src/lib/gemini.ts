import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY가 환경변수에 설정되지 않았습니다.');
}
const ai = new GoogleGenAI({ apiKey });

export async function generateGeminiText(prompt: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const text = result.text;
  if (!text) throw new Error("Gemini 응답 오류");

  return text.trim();
}
