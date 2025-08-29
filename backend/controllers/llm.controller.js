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

// Supported LLM providers and their models
const LLM_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 }
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', maxTokens: 200000 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', maxTokens: 200000 }
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

// @desc    Stream response from LLM
// @route   POST /api/llm/stream
// @access  Private
const streamResponse = asyncHandler(async (req, res) => {
  const { provider, model, messages, temperature = 0.7, maxTokens = 1000 } = req.body;

  if (!provider || !model || !messages) {
    res.status(400);
    throw new Error('Please provide provider, model, and messages');
  }

  if (!LLM_PROVIDERS[provider]) {
    res.status(404);
    throw new Error('Provider not supported');
  }

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // For now, simulate streaming by sending the response in chunks
    const response = await generateResponse(req, { json: () => {} });
    
    // Send response in chunks to simulate streaming
    const content = response.data?.response || 'No response generated';
    const chunks = content.match(/.{1,50}/g) || [content];
    
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('LLM Streaming Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to stream response' })}\n\n`);
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
    const selectedModel = model || (provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet');

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