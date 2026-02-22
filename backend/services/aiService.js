import axios from 'axios';

// Response cache to avoid repeated API calls
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// System prompts for different modes
const SYSTEM_PROMPTS = {
  exam: `You are MentorAI, an exam-oriented academic mentor. 
Provide concise, structured answers focused on:
- Key definitions and concepts
- Important points for exams
- Clear examples
- Quick revision notes
Keep answers crisp and exam-relevant.`,

  coding: `You are MentorAI, a coding mentor specializing in programming and DSA.
Provide step-by-step explanations:
- Break down the logic
- Show code with proper syntax
- Explain time and space complexity
- Include edge cases and optimizations
- Use examples to illustrate concepts`,

  syllabus: `You are MentorAI, a syllabus summarizer.
Generate structured summaries:
- Unit-wise breakdown
- Important topics for each unit
- Key points to focus on
- Study priority (High/Medium/Low)
- Quick revision notes for exams`
};

// List of working models (in order of preference)
const WORKING_MODELS = [
  'meta-llama/llama-3-8b-instruct',  
  'mistralai/mistral-7b-instruct',    
  'google/gemma-7b-it',               
  'microsoft/phi-3-mini-128k-instruct', 
];
// Configuration
const MODEL_CONFIG = {
  name: WORKING_MODELS[0], // Use first working model
  maxTokens: 800,
  temperature: 0.5,
  timeout: 15000
};

/**
 * Try different models until one works
 */
const tryWithFallbackModels = async (messages, config) => {
  let lastError = null;

  for (const model of WORKING_MODELS) {
    try {
      console.log(`🔄 Trying model: ${model}`);

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'MentorAI',
            'Content-Type': 'application/json'
          },
          timeout: config.timeout
        }
      );

      console.log(`✅ Success with model: ${model}`);
      return response.data.choices[0].message.content;

    } catch (error) {
      console.log(`❌ Model ${model} failed:`, error.response?.data?.error?.message || error.message);
      lastError = error;
      // Continue to next model
    }
  }

  throw lastError || new Error('All models failed');
};

/**
 * Generate AI response with caching and fallback models
 */
export const generateAIResponse = async (message, mode = 'exam', context = '') => {
  const startTime = Date.now();

  try {
    // Create cache key
    const cacheKey = `${mode}:${message}:${context.substring(0, 100)}`;

    // Check cache first
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`⚡ Cache hit! Response time: ${Date.now() - startTime}ms`);
        return cached.response;
      }
      responseCache.delete(cacheKey);
    }

    console.log(`🤖 Generating AI response for mode: ${mode}`);

    // Prepare messages
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS[mode]
      },
      {
        role: 'user',
        content: context ? `${context}\n\nUser query: ${message}` : message
      }
    ];

    // Try models with fallback
    const aiResponse = await tryWithFallbackModels(messages, MODEL_CONFIG);

    const responseTime = Date.now() - startTime;
    console.log(`✅ Response generated in ${responseTime}ms`);

    // Cache the response
    responseCache.set(cacheKey, {
      response: aiResponse,
      timestamp: Date.now()
    });

    return aiResponse;

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ API error after ${errorTime}ms:`, error.response?.data || error.message);

    // Return a friendly fallback message instead of throwing
    return "I'm having trouble connecting to the AI service right now. Please try again in a moment. If the issue persists, check your OpenRouter API key.";
  }
};

/**
 * Generate structured summary with fallback models
 */
export const generateSummary = async (content, mode = 'syllabus') => {
  const startTime = Date.now();

  try {
    // Check cache for summaries
    const cacheKey = `summary:${content.substring(0, 200)}`;

    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`⚡ Summary cache hit!`);
        return cached.response;
      }
    }

    console.log('📝 Generating summary...');

    const messages = [
      {
        role: 'system',
        content: 'You are a summarizer. Generate structured summaries with unit-wise topics, key points, and exam priorities. Return valid JSON only.'
      },
      {
        role: 'user',
        content: `Summarize this content for exam preparation. Return JSON with format: { "unitWiseTopics": [{ "unit": "string", "topics": ["string"], "importance": "High/Medium/Low" }], "keyPoints": ["string"], "examPriority": [{ "topic": "string", "reason": "string", "weightage": "string" }] }\n\nContent: ${content.substring(0, 3000)}`
      }
    ];

    // Try models with fallback for summary
    const summaryText = await tryWithFallbackModels(messages, {
      ...MODEL_CONFIG,
      maxTokens: 1000,
      temperature: 0.3
    });

    let summary;

    // Parse JSON response
    try {
      summary = JSON.parse(summaryText);
    } catch (e) {
      console.error('Failed to parse JSON, trying to extract');
      // Extract JSON from text if wrapped in markdown
      const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ Summary generated in ${responseTime}ms`);

    // Cache the summary
    responseCache.set(cacheKey, {
      response: summary,
      timestamp: Date.now()
    });

    return summary;

  } catch (error) {
    console.error('Summary generation error:', error);

    // Return structured fallback
    return {
      unitWiseTopics: [
        {
          unit: 'Main Topics',
          topics: ['Content analysis in progress'],
          importance: 'High'
        }
      ],
      keyPoints: [
        'Summary generation in progress',
        'Please try again for detailed analysis'
      ],
      examPriority: [
        {
          topic: 'Key Concepts',
          reason: 'Fundamental to understanding',
          weightage: 'High'
        }
      ]
    };
  }
};

/**
 * Clear the response cache
 */
export const clearCache = () => {
  responseCache.clear();
  console.log('🗑️ Cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys())
  };
};

/**
 * Test all models to find which work
 */
export const testAllModels = async () => {
  const results = [];

  for (const model of WORKING_MODELS) {
    try {
      const start = Date.now();
      await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [{ role: 'user', content: 'Say "ok" in one word' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'MentorAI'
          },
          timeout: 5000
        }
      );
      const time = Date.now() - start;
      results.push({ model, status: '✅ Working', time: `${time}ms` });
    } catch (error) {
      results.push({
        model,
        status: '❌ Failed',
        error: error.response?.data?.error?.message || error.message
      });
    }
  }

  console.table(results);
  return results;
};