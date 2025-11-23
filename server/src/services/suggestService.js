const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate(text) {
  if (!text || !text.trim()) return [];

  try {
    const prompt = `
      You are a social media expert. Analyze the following text and give 5 suggestions
      to improve engagement, readability, hashtags, CTA, and sentiment:

      Text:
      ${text}

      Suggestions:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      temperature: 0.7,
      maxOutputTokens: 300
    });

    const rawText = response.text || '';
    const suggestions = rawText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    return suggestions.length ? suggestions : [];
  } catch (error) {
    console.error('Gemini API error:', error);
    return [];
  }
}

module.exports.generate = generate;
