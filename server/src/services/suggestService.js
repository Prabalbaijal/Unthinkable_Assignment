const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate(text) {
  if (!text || !text.trim()) return [];

  try {
    const prompt = `
      You are a social media expert. Analyze the following text and give 5 suggestions
      to improve engagement, readability, hashtags, CTA, and sentiment.

      Text:
      ${text}

      Return your suggestions in JSON format exactly like this:
      [
        {
          "title": "Short title of suggestion",
          "problem": "What is the problem with the current text",
          "suggestion": "Your recommended improvement",
          "example": "Optional example showing improvement"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      temperature: 0.7,
      maxOutputTokens: 500
    });

    let rawText = response.text || '';

    // ------------------------------
    // Clean rawText: remove ```json or ``` codeblocks
    // ------------------------------
    rawText = rawText.trim()
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '');

    const match = rawText.match(/\[.*\]/s);
    const cleanJson = match ? match[0] : rawText;

    // Parse JSON
    const suggestions = JSON.parse(cleanJson);

    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Gemini API error or JSON parse error:', error);
    return [];
  }
}

module.exports.generate = generate;