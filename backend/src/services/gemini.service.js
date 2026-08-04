const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROMPT = `You are a food analysis AI. Analyze this food image and return a JSON object with exactly these fields:
{
  "cuisine": "<single string, e.g. Indian, Italian, Chinese, Mexican, American, Thai, Japanese, Mediterranean, Middle Eastern, Other>",
  "ingredients": ["<key visible or inferable ingredients, max 8>"],
  "dietary": ["<applicable labels from: vegetarian, vegan, non-vegetarian, gluten-free, dairy-free, halal, jain, keto, high-protein>"],
  "mood": ["<applicable labels from: comfort food, street food, fine dining, healthy, indulgent, snack, breakfast, dessert, festive>"]
}

Respond ONLY with the raw JSON object. No markdown, no explanation.`;

/**
 * Extracts structured food tags from an image buffer using Gemini Vision.
 * @param {Buffer} imageBuffer - Raw image bytes (JPEG/PNG)
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<{cuisine:string, ingredients:string[], dietary:string[], mood:string[]}>}
 */
async function generateProductTags(imageBuffer, mimeType = 'image/jpeg') {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Gemini] GEMINI_API_KEY not set — skipping AI tagging');
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([PROMPT, imagePart]);
  const text = result.response.text().trim();

  // Strip markdown code fences if model wraps in ```json ... ```
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
  const tags = JSON.parse(cleaned);

  return {
    cuisine: tags.cuisine || '',
    ingredients: Array.isArray(tags.ingredients) ? tags.ingredients : [],
    dietary: Array.isArray(tags.dietary) ? tags.dietary : [],
    mood: Array.isArray(tags.mood) ? tags.mood : [],
  };
}

module.exports = { generateProductTags };
