# Code Review API Documentation

This document describes how to use the AI-powered code review functionality in the Symbi Trust Protocol.

## Setup

1. **Add your API keys** to the `.env` file:
   ```bash
   # Replace with your actual OpenAI API key
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   
   # Replace with your actual Anthropic API key
   ANTHROPIC_API_KEY=your-actual-anthropic-key-here
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

## API Endpoint

### POST `/api/llm/code-review`

Perform AI-powered code review using OpenAI or Anthropic models.

#### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

#### Request Body
```json
{
  "code": "function example() { return 'Hello World'; }",
  "language": "javascript",
  "provider": "openai",
  "model": "gpt-4",
  "reviewType": "comprehensive"
}
```

#### Parameters

- **code** (required): The code to review
- **language** (optional): Programming language (e.g., "javascript", "python", "java")
- **provider** (optional): AI provider - "openai" or "anthropic" (default: "openai")
- **model** (optional): Specific model to use
  - OpenAI: "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"
  - Anthropic: "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"
- **reviewType** (optional): Type of review
  - "comprehensive" (default): Full code review
  - "security": Security-focused review
  - "performance": Performance optimization review
  - "style": Code style and maintainability review

#### Response
```json
{
  "success": true,
  "data": {
    "review": "Detailed code review feedback...",
    "provider": "openai",
    "model": "gpt-4",
    "reviewType": "comprehensive",
    "usage": {
      "promptTokens": 150,
      "completionTokens": 500,
      "totalTokens": 650
    },
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

## Example Usage

### Using cURL

```bash
# First, get an authentication token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Then use the token for code review
curl -X POST http://localhost:5000/api/llm/code-review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "function calculateTotal(items) { let total = 0; for(let i = 0; i < items.length; i++) { total += items[i].price; } return total; }",
    "language": "javascript",
    "provider": "openai",
    "reviewType": "comprehensive"
  }'
```

### Using JavaScript/Fetch

```javascript
const reviewCode = async (code, options = {}) => {
  const response = await fetch('/api/llm/code-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      code,
      language: options.language || 'javascript',
      provider: options.provider || 'openai',
      reviewType: options.reviewType || 'comprehensive'
    })
  });
  
  const result = await response.json();
  return result;
};

// Example usage
const codeToReview = `
function processUserData(userData) {
  // Potential security issue: no input validation
  const query = "SELECT * FROM users WHERE id = " + userData.id;
  return database.query(query);
}
`;

reviewCode(codeToReview, { 
  language: 'javascript', 
  reviewType: 'security' 
})
.then(result => {
  if (result.success) {
    console.log('Code Review:', result.data.review);
  }
});
```

## Review Types

### Comprehensive Review
Provides a complete analysis covering:
- Code quality and best practices
- Security vulnerabilities
- Performance optimizations
- Bug detection
- Maintainability and readability
- Architecture and design patterns

### Security Review
Focuses specifically on:
- Security vulnerabilities (OWASP Top 10)
- Input validation issues
- Authentication and authorization flaws
- Data exposure risks
- Injection attacks
- Cryptographic issues

### Performance Review
Analyzes:
- Algorithm efficiency
- Memory usage optimization
- Database query optimization
- Caching opportunities
- Bottleneck identification
- Scalability concerns

### Style Review
Evaluates:
- Code formatting and consistency
- Naming conventions
- Code organization
- Documentation and comments
- Refactoring opportunities
- Technical debt

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **400**: Bad request (missing code, invalid provider, etc.)
- **401**: Unauthorized (invalid or missing JWT token)
- **500**: Server error (API key issues, provider errors, etc.)

Example error response:
```json
{
  "success": false,
  "message": "OpenAI API key not configured"
}
```

## Security Notes

1. **API Keys**: Never commit actual API keys to version control
2. **Authentication**: All requests require valid JWT authentication
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Code Privacy**: Be mindful of sending sensitive code to external AI providers
5. **Logging**: API keys and sensitive code are not logged

## Cost Considerations

- **OpenAI**: Charges per token (input + output)
- **Anthropic**: Charges per token (input + output)
- **Model Selection**: Larger models (GPT-4, Claude-3-Opus) cost more but provide better analysis
- **Review Length**: Longer code reviews consume more tokens

Monitor your usage through the respective provider dashboards.