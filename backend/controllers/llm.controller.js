const asyncHandler = require('express-async-handler');
const axios = require('axios');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize API clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// Initialize Perplexity client
const perplexity = process.env.PERPLEXITY_API_KEY ? {
  apiKey: process.env.PERPLEXITY_API_KEY,
} : null;

// Initialize v0 client
const v0 = process.env.V0_API_KEY ? {
  apiKey: process.env.V0_API_KEY,
} : null;

// Supported LLM providers and their models
const LLM_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', maxTokens: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 }
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 200000 }
    ],
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  google: {
    name: 'Google',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32768 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', maxTokens: 16384 }
    ],
    endpoint: 'https://generativelanguage.googleapis.com/v1/models'
  },
  perplexity: {
    name: 'Perplexity',
    models: [
      { id: 'llama-3.1-sonar-small-128k-online', name: 'Llama 3.1 Sonar Small 128K Online', maxTokens: 127072 },
      { id: 'llama-3.1-sonar-large-128k-online', name: 'Llama 3.1 Sonar Large 128K Online', maxTokens: 127072 },
      { id: 'llama-3.1-sonar-huge-128k-online', name: 'Llama 3.1 Sonar Huge 128K Online', maxTokens: 127072 }
    ],
    endpoint: 'https://api.perplexity.ai/chat/completions'
  },
  v0: {
    name: 'v0 by Vercel',
    models: [
      { id: 'v0-1', name: 'v0 Model', maxTokens: 4096 }
    ],
    endpoint: 'https://api.v0.dev/chat/completions'
  }
};

// @desc    Get available LLM providers
// @route   GET /api/llm/providers
// @access  Private
const getProviders = asyncHandler(async (req, res) => {
  const providers = Object.keys(LLM_PROVIDERS).map(key => ({
    id: key,
    name: LLM_PROVIDERS[key].name,
    modelCount: LLM_PROVIDERS[key].models.length
  }));

  res.json({
    success: true,
    data: providers
  });
});

// @desc    Get models for a specific provider
// @route   GET /api/llm/models/:provider
// @access  Private
const getModels = asyncHandler(async (req, res) => {
  const { provider } = req.params;

  if (!LLM_PROVIDERS[provider]) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Dynamic fetch for OpenAI models when API key is configured
  if (provider === 'openai' && openai) {
    try {
      const list = await openai.models.list();
      // Heuristic: surface chat-capable GPT models and 4o variants first
      const models = list.data
        .map(m => ({ id: m.id, created: m.created }))
        .filter(m => /^(gpt|o)/.test(m.id))
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .map(m => ({ id: m.id, name: m.id, maxTokens: null }));

      if (models.length) {
        return res.json({
          success: true,
          data: { provider: LLM_PROVIDERS[provider].name, models }
        });
      }
    } catch (e) {
      // Fall back to static list on error
      console.warn('Failed to fetch OpenAI models dynamically, using static list:', e.message);
    }
  }

  res.json({
    success: true,
    data: {
      provider: LLM_PROVIDERS[provider].name,
      models: LLM_PROVIDERS[provider].models
    }
  });
});

// @desc    Generate response from LLM
// @route   POST /api/llm/generate
// @access  Private
const generateResponse = asyncHandler(async (req, res) => {
  const { provider, model, messages, temperature = 0.7, maxTokens = 1000 } = req.body;

  if (!provider || !model || !messages) {
    res.status(400);
    throw new Error('Please provide provider, model, and messages');
  }

  if (!LLM_PROVIDERS[provider]) {
    res.status(404);
    throw new Error('Provider not supported');
  }

  try {
    let response;

    switch (provider) {
      case 'openai':
        response = await generateOpenAIResponse(model, messages, temperature, maxTokens);
        break;
      case 'anthropic':
        response = await generateAnthropicResponse(model, messages, temperature, maxTokens);
        break;
      case 'google':
        response = await generateGoogleResponse(model, messages, temperature, maxTokens);
        break;
      case 'perplexity':
        response = await generatePerplexityResponse(model, messages, temperature, maxTokens);
        break;
      case 'v0':
        response = await generateV0Response(model, messages, temperature, maxTokens);
        break;
      default:
        res.status(400);
        throw new Error('Provider not implemented');
    }

    res.json({
      success: true,
      data: {
        provider,
        model,
        response: response.content,
        usage: response.usage || {}
      }
    });
  } catch (error) {
    console.error('LLM Generation Error:', error);
    res.status(500);
    throw new Error('Failed to generate response from LLM');
  }
});

// @desc    Stream response from LLM (SSE for OpenAI)
// @route   POST /api/llm/stream
// @access  Private
const streamResponse = asyncHandler(async (req, res) => {
  const { provider = 'openai', model = 'gpt-4o', messages, temperature = 0.7, maxTokens = 1000 } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'messages array is required' });
  }

  if (provider !== 'openai') {
    return res.status(400).json({ success: false, message: 'Streaming supported for provider=openai only at this time' });
  }
  if (!openai) {
    return res.status(400).json({ success: false, message: 'OpenAI API key not configured' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content || '';
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
    res.write(`event: done\n`);
    res.write(`data: {}\n\n`);
    res.end();
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message || 'stream failed' })}\n\n`);
    res.end();
  }
});

// Helper function for OpenAI API
const generateOpenAIResponse = async (model, messages, temperature, maxTokens) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 1000,
    });

    return {
      content: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
};

// Helper function for Anthropic API
const generateAnthropicResponse = async (model, messages, temperature, maxTokens) => {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    // Convert OpenAI format messages to Anthropic format
    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessages = messages.filter(msg => msg.role !== 'system');

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens || 1000,
      temperature: temperature || 0.7,
      system: systemMessage?.content || '',
      messages: userMessages
    });

    return {
      content: response.content[0].text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw new Error(`Anthropic API Error: ${error.message}`);
  }
};

// Helper function for Google API
const generateGoogleResponse = async (model, messages, temperature, maxTokens) => {
  // This is a placeholder - in a real implementation, you'd use the Google API
  return {
    content: `Mock Google response from ${model}: ${messages[messages.length - 1]?.content}`,
    usage: { promptTokenCount: 50, candidatesTokenCount: 100 }
  };
};

// Helper function for Perplexity API
const generatePerplexityResponse = async (model, messages, temperature, maxTokens) => {
  if (!perplexity) {
    throw new Error('Perplexity API key not configured');
  }

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: model,
      messages: messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexity.apiKey}`
      }
    });

    return {
      content: response.data.choices[0].message.content,
      usage: {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens
      }
    };
  } catch (error) {
    console.error('Perplexity API Error:', error);
    throw new Error(`Perplexity API Error: ${error.message}`);
  }
};

// Helper function for v0 API
const generateV0Response = async (model, messages, temperature, maxTokens) => {
  if (!v0) {
    throw new Error('v0 API key not configured');
  }

  try {
    const response = await axios.post('https://api.v0.dev/chat/completions', {
      model: model,
      messages: messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${v0.apiKey}`
      }
    });

    return {
      content: response.data.choices[0].message.content,
      usage: {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens
      }
    };
  } catch (error) {
    console.error('v0 API Error:', error);
    throw new Error(`v0 API Error: ${error.message}`);
  }
};

// @desc    Perform code review using AI
// @route   POST /api/llm/code-review
// @access  Private
const performCodeReview = asyncHandler(async (req, res) => {
  const { code, language, provider = 'openai', model, reviewType = 'comprehensive' } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Code content is required'
    });
  }

  const reviewPrompts = {
    comprehensive: `Please perform a comprehensive code review of the following ${language || 'code'}. Analyze:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance optimizations
4. Bug detection
5. Maintainability and readability
6. Architecture and design patterns

Provide specific suggestions with line references where applicable.

Code:
\`\`\`${language || ''}
${code}
\`\`\``,
    security: `Please perform a security-focused code review of the following ${language || 'code'}. Focus on:
1. Security vulnerabilities (OWASP Top 10)
2. Input validation issues
3. Authentication and authorization flaws
4. Data exposure risks
5. Injection attacks
6. Cryptographic issues

Code:
\`\`\`${language || ''}
${code}
\`\`\``,
    performance: `Please perform a performance-focused code review of the following ${language || 'code'}. Analyze:
1. Algorithm efficiency
2. Memory usage optimization
3. Database query optimization
4. Caching opportunities
5. Bottleneck identification
6. Scalability concerns

Code:
\`\`\`${language || ''}
${code}
\`\`\``,
    style: `Please perform a code style and maintainability review of the following ${language || 'code'}. Focus on:
1. Code formatting and consistency
2. Naming conventions
3. Code organization
4. Documentation and comments
5. Refactoring opportunities
6. Technical debt

Code:
\`\`\`${language || ''}
${code}
\`\`\``
  };

  const messages = [
    {
      role: 'system',
      content: 'You are an expert code reviewer with extensive experience in software development, security, and best practices. Provide detailed, actionable feedback.'
    },
    {
      role: 'user',
      content: reviewPrompts[reviewType] || reviewPrompts.comprehensive
    }
  ];

  try {
    let result;
    const selectedModel = model || (provider === 'openai' ? 'gpt-4o' : 'claude-3-sonnet-20240229');

    if (provider === 'openai') {
      result = await generateOpenAIResponse(selectedModel, messages, 0.3, 2000);
    } else if (provider === 'anthropic') {
      result = await generateAnthropicResponse(selectedModel, messages, 0.3, 2000);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported provider for code review'
      });
    }

    res.json({
      success: true,
      data: {
        review: result.content,
        provider: provider,
        model: selectedModel,
        reviewType: reviewType,
        usage: result.usage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform code review'
    });
  }
});

module.exports = {
  getProviders,
  getModels,
  generateResponse,
  streamResponse,
  performCodeReview
};
