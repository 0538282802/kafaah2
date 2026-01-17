
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const estimateMaintenanceCost = async (serviceType: string, description: string): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على المشكلة التالية في خدمة ${serviceType}: "${description}"، قدر التكلفة التقريبية بالريال السعودي. أجب برقم فقط.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPrice: { 
              type: Type.NUMBER,
              description: "The estimated maintenance cost in Saudi Riyals"
            }
          },
          required: ["estimatedPrice"]
        }
      }
    });

    const text = response.text;
    const data = JSON.parse(text || '{"estimatedPrice": 150}');
    return data.estimatedPrice;
  } catch (error) {
    console.error("AI Estimation failed:", error);
    return 150;
  }
};

export const diagnoseProblemForTech = async (serviceType: string, description: string, mediaUrl?: string): Promise<{ diagnosis: string, tools: string[], advice: string }> => {
  try {
    const prompt = `أنت مساعد تقني خبير للفنيين في تطبيق "كفاءة بلس". 
    الخدمة: ${serviceType}
    وصف العميل: ${description}
    قم بتحليل المشكلة وتقديم تشخيص تقني، قائمة بالأدوات المقترحة، ونصيحة مهنية.
    اجعل الأسلوب تقني ومختصر ومحفز للفني.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: "التشخيص التقني المتوقع" },
            tools: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "قائمة الأدوات والقطع المقترحة"
            },
            advice: { type: Type.STRING, description: "نصيحة مهنية سريعة للفني" }
          },
          required: ["diagnosis", "tools", "advice"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (error) {
    console.error("AI Diagnosis failed:", error);
    return {
      diagnosis: "يتعذر التحليل اللحظي، يرجى الفحص الميداني.",
      tools: ["حقيبة الأدوات الأساسية"],
      advice: "تأكد من فصل التيار/المياه قبل البدء."
    };
  }
};
