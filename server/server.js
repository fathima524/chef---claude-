// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// ✅ Retry helper
// ======================
async function retryApiCall(apiCall, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay} ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ======================
// ✅ Hugging Face call helper
// ======================
async function callHuggingFaceAPI(prompt, maxTokens = 80, temperature = 0.8) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false,
          do_sample: true,
        },
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(`HuggingFace error: ${data.error}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
}

// ======================
// ✅ Recipe titles endpoint
// ======================
app.post('/api/get-recipe', async (req, res) => {
  const { ingredients, timeLimit } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one ingredient.' });
  }

  if (!timeLimit || timeLimit <= 0) {
    return res.status(400).json({ error: 'Please provide a valid time limit.' });
  }

  const userPrompt = `Generate exactly 3 unique recipe names using these ingredients: ${ingredients.join(', ')}.
Each recipe must be cookable within ${timeLimit} minutes.
Return only the recipe names, one per line.`;

  try {
    console.log('Generating recipes for:', ingredients.join(', '), `(${timeLimit} min)`);

    const data = await retryApiCall(() => callHuggingFaceAPI(userPrompt, 80, 0.8));

    const rawText = data[0]?.generated_text || '';
    console.log('Raw AI Response:', rawText);

    let lines = rawText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim());

    let uniqueRecipes = [...new Set(lines)].slice(0, 3);

    if (uniqueRecipes.length === 0) {
      uniqueRecipes = [`Quick ${ingredients[0]} Recipe`];
    }

    res.json({ recipes: uniqueRecipes });

  } catch (error) {
  console.error('❌ Recipe generation error:', error);

  res.status(500).json({
    error: error.message || 'Unknown error occurred',
    debug: {
      full: error, // the raw error object (may get stringified to `[Object object]`)
      stack: error.stack || null
    }
  });
  }
});

// ======================
// ✅ Full recipe steps endpoint
// ======================
app.post('/api/get-full-recipe', async (req, res) => {
  const { title, ingredients, timeLimit } = req.body;

  if (!title || !ingredients || !timeLimit) {
    return res.status(400).json({ error: 'Missing required recipe information.' });
  }

  const userPrompt = `Write detailed cooking instructions for "${title}" using these ingredients: ${ingredients.join(', ')}.
Cooking time: ${timeLimit} minutes maximum.
Format as numbered steps.`;

  try {
    console.log('Generating full recipe for:', title);

    const data = await retryApiCall(() => callHuggingFaceAPI(userPrompt, 400, 0.7));

    const rawText = data[0]?.generated_text || '';
    console.log('Raw recipe steps:', rawText);

    const cleaned = rawText.trim();
    res.json({ steps: cleaned });

  } catch (error) {
    console.error('❌ Full recipe generation error:', error);
    res.status(500).json({
      error: 'Could not generate full recipe.',
      debug: error.message,
      stack: error.stack,
    });
  }
});

// ======================
// ✅ Health check
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    huggingface_key: process.env.HUGGINGFACE_API_KEY ? 'configured' : 'missing',
  });
});

// ======================
// ✅ Start server
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`HuggingFace API Key: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Missing!'}`);
});
