# Symbi Trust Protocol

Brief: Symbi Trust Protocol is a signature-oriented application (frontend + backend) designed to manage cryptographic signing operations and trust workflows. This repository contains the application code, CI, and governance files.

## Quickstart (local)
1. Install dependencies:
   - npm ci
2. Start backend:
   - cd backend && npm run dev
3. Start frontend:
   - cd frontend && npm run dev
4. Run tests:
   - npm test --workspace=backend --if-present
   - npm test --workspace=frontend --if-present

## What this repo contains
- /api — Serverless API functions for Vercel deployment
- /app — Next.js frontend application with App Router
- /components — Reusable React components for UI
- /lib — Utility functions and database connections
- /monitoring — Grafana dashboards and Alertmanager configurations for observability
- .github/workflows — CI and security workflows
- docs/ — architecture and API specs (recommended)

## Core priorities
- Secure key handling: prefer client-side key storage for user keys. If keys are managed server-side, use KMS/HSM.
- Strong auth: MFA, secure password hashing (Argon2/bcrypt), refresh tokens, RBAC.
- Observability: audit logs, metrics, tracing.

## Recent Changes
- Migrated from Express.js to Next.js App Router with Vercel serverless functions
- Added comprehensive AI provider integration (OpenAI, Anthropic, Together AI, Perplexity, v0)
- Implemented agent-to-agent bonding system with multi-step rituals
- Enhanced trust protocol with cryptographic signing and weighted consensus
- Added real-time communication capabilities with Socket.io integration
- Integrated OpenAI Assistant API with function calling capabilities
- Implemented context bridge system for semantic search and knowledge management
- Added production monitoring with Grafana dashboards and Alertmanager
- Enhanced security with comprehensive middleware and rate limiting

## Architecture Overview

### Frontend (Next.js App Router)
- **Dashboard**: Main interface with trust protocol overview and agent management
- **AI Agents**: Agent creation, configuration, and bonding system
- **Conversations**: Real-time chat with AI agents and assistants
- **Assistants**: OpenAI Assistant integration with function calling
- **Trust Protocol**: Cryptographic signing and compliance validation
- **Context Bridge**: Semantic search and knowledge management
- **Reports**: Analytics and system monitoring

### Backend (Vercel Serverless Functions)
- **Authentication**: JWT-based auth with secure password hashing
- **Agent Management**: CRUD operations for AI agents with bonding capabilities
- **Trust Protocol**: Cryptographic signing, consensus mechanisms, and compliance scoring
- **AI Integration**: Multi-provider support (OpenAI, Anthropic, Together AI, Perplexity, v0)
- **Assistant Integration**: OpenAI Assistant API with 16 specialized functions
- **Real-time Communication**: Socket.io for live updates and agent interactions
- **Database**: MongoDB with comprehensive schemas for all entities

### Key Features
1. **Multi-Agent Communication**: Real-time messaging between agents with Socket.IO
2. **Agent Bonding System**: Complete bonding ritual with progress tracking
3. **Trust Protocol Integration**: Trust scores, ethical alignment, and CI model support
4. **Context Bridge**: Semantic search and context management with Weaviate
5. **Real-Time Updates**: Live message updates and agent status changes
6. **Security Features**: Encrypted messaging and trust validation
7. **Modern UI/UX**: Material-UI components with responsive design
8. **Theme Support**: Dark/light mode switching
9. **Authentication**: Protected routes with user session management
10. **External Integration**: OpenAI Assistant API integration

## Environment Variables

### Required
\`\`\`bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project0

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key

# AI Providers
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
TOGETHER_API_KEY=your-together-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
V0_API_KEY=your-v0-api-key
\`\`\`

### Optional (Enhanced Features)
\`\`\`bash
# Weaviate Vector Database
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
WEAVIATE_TIMEOUT=30000
DEFAULT_SEARCH_LIMIT=10
DEFAULT_SIMILARITY_THRESHOLD=0.7

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
\`\`\`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Alternative Platforms
- **Railway**: Backend-focused deployment
- **Render**: Full-stack deployment
- **Heroku**: Traditional deployment

## Monitoring & Observability

### Grafana Dashboards
- Application metrics monitoring
- Request duration and error rate tracking
- Real-time performance visualization

### Alertmanager Configuration
- Critical alerts via email and Slack
- Performance monitoring alerts
- Automated incident response

### Database Collections
- `users` - User accounts and authentication
- `agents` - AI agent configurations and bonding data
- `conversations` - Chat logs and message history
- `trustdeclarations` - Trust protocol compliance data
- `assistants` - OpenAI Assistant configurations

## Development

### Local Setup
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

### API Testing
\`\`\`bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test agent creation
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Agent","provider":"openai","model":"gpt-4"}'
\`\`\`

## Roadmap
- Publish OpenAPI spec and SDK
- Add MFA and WebAuthn support
- Implement API rate limiting and signing policy enforcement
- Add automated security scanning and periodic pentest
- Enhanced agent-to-agent communication protocols
- Advanced trust protocol features with zero-knowledge proofs
- Integration with additional AI providers and models
- Mobile application development
- Enterprise SSO integration
