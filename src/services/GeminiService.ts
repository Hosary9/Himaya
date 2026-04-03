import { GoogleGenAI } from '@google/genai';

const _systemPrompt = `أنت محامٍ مصري خبير متخصص في صياغة العقود القانونية وفقاً للقانون المدني
المصري رقم 131 لسنة 1948 وتعديلاته. صِغ عقداً احترافياً كاملاً باللغة
العربية الفصحى القانونية. ابدأ بـ 'بسم الله الرحمن الرحيم'. استخدم المواد
القانونية المناسبة. لا تترك أي فراغات أو أقواس. أضف بنود الحماية القانونية
الكاملة وخانات التوقيع والشهود في النهاية.`;

export async function generateContract(contractType: string, data: Record<string, string>): Promise<string> {
  try {
    // Initialize Gemini API
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    
    // Build user prompt
    let userPrompt = `الرجاء صياغة ${contractType} بناءً على البيانات التالية:\n\n`;
    Object.entries(data).forEach(([key, value]) => {
      userPrompt += `- ${key}: ${value}\n`;
    });

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: _systemPrompt,
        temperature: 0.3,
      }
    });

    if (!response.text) {
      throw new Error('لم يتم استلام نص من الذكاء الاصطناعي');
    }

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
  }
}
