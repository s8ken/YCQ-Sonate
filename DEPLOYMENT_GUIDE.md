# SYMBI Trust Protocol - Deployment Guide

## Overview
This guide covers deploying the SYMBI Trust Protocol platform, a sovereign AI trust management system with multi-provider AI integration, cryptographic verification, and consensus mechanisms.

## Architecture Components

### Backend Services
- **Node.js/Express API** - Core trust protocol engine
- **MongoDB** - Trust declarations and user data
- **Redis** - Session management and caching
- **Socket.io** - Real-time communication

### Frontend
- **Next.js** - Modern React-based interface
- **Tailwind CSS** - Responsive design system
- **shadcn/ui** - Component library

### AI Integrations
- **OpenAI** - GPT models and assistants
- **Anthropic** - Claude models
- **Together AI** - Open source models
- **Perplexity** - Search-augmented models

## Environment Setup

### Required Environment Variables

\`\`\`bash
# Database
MONGODB_URI=mongodb://localhost:27017/symbi-trust-protocol
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TOGETHER_API_KEY=...
PERPLEXITY_API_KEY=pplx-...

# Security
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=production

# Trust Protocol
MIN_TRUST_SCORE=0.6
DEFAULT_CONSENSUS_THRESHOLD=0.75
\`\`\`

## Deployment Options

### Option 1: Vercel + MongoDB Atlas (Recommended)

#### Frontend Deployment
1. **Deploy to Vercel**
   \`\`\`bash
   npm install -g vercel
   vercel --prod
   \`\`\`

2. **Configure Environment Variables**
   - Add all required env vars in Vercel dashboard
   - Set `NEXT_PUBLIC_API_URL` to your backend URL

#### Backend Deployment
1. **Deploy API to Vercel Functions**
   \`\`\`bash
   # Create vercel.json in backend/
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   \`\`\`

2. **Database Setup**
   - Create MongoDB Atlas cluster
   - Configure network access and database user
   - Update `MONGODB_URI` environment variable

### Option 2: Docker Deployment

#### Build and Run with Docker Compose
\`\`\`bash
# Clone repository
git clone <repository-url>
cd symbi-trust-protocol

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Build and start services
docker-compose up -d

# Run integration tests
npm run test:integration
\`\`\`

#### Docker Compose Configuration
\`\`\`yaml
version: '3.8'
services:
  frontend:
    build: ./
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/symbi-trust-protocol
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
\`\`\`

### Option 3: Cloud Provider Deployment

#### AWS Deployment
1. **ECS/Fargate** for containerized deployment
2. **DocumentDB** for MongoDB compatibility
3. **ElastiCache** for Redis
4. **Application Load Balancer** for traffic distribution
5. **CloudFront** for CDN and static assets

#### Google Cloud Deployment
1. **Cloud Run** for serverless containers
2. **Cloud Firestore** or **MongoDB Atlas**
3. **Cloud Memorystore** for Redis
4. **Cloud Load Balancing**

## Security Configuration

### SSL/TLS Setup
\`\`\`bash
# Generate SSL certificates (Let's Encrypt)
certbot --nginx -d your-domain.com

# Or use Cloudflare for SSL termination
\`\`\`

### API Security Headers
\`\`\`javascript
// Already configured in security.middleware.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
\`\`\`

### Rate Limiting
\`\`\`javascript
// Configured per endpoint
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
});
\`\`\`

## Monitoring and Observability

### Health Checks
\`\`\`bash
# API Health
curl http://localhost:5000/

# Database Health
curl http://localhost:5000/api/trust

# AI Providers Health
curl http://localhost:5000/api/llm/providers
\`\`\`

### Logging Configuration
\`\`\`javascript
// Winston logger setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
\`\`\`

### Metrics Collection
- **Trust Declaration Metrics**: Creation rate, verification success rate
- **AI Provider Metrics**: Response times, error rates, token usage
- **Consensus Metrics**: Validator participation, consensus success rate
- **System Metrics**: CPU, memory, database connections

## Testing and Validation

### Pre-Deployment Testing
\`\`\`bash
# Run integration tests
node scripts/test-integration.js

# Run unit tests
npm test

# Run security audit
npm audit

# Check code quality
npm run lint
\`\`\`

### Post-Deployment Validation
1. **Smoke Tests**: Verify all endpoints respond
2. **Trust Protocol Tests**: Create, sign, and verify declarations
3. **AI Integration Tests**: Test all provider connections
4. **Performance Tests**: Load testing with realistic traffic
5. **Security Tests**: Penetration testing and vulnerability scans

## Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Distribute traffic across multiple backend instances
- **Database Sharding**: Partition trust declarations by agent_id
- **Redis Clustering**: Scale session and cache storage
- **CDN**: Cache static assets and API responses

### Performance Optimization
- **Database Indexing**: Optimize queries for trust declarations
- **Caching Strategy**: Cache frequently accessed data
- **Connection Pooling**: Optimize database connections
- **Async Processing**: Queue heavy operations

## Backup and Recovery

### Database Backup
\`\`\`bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
rm -rf $BACKUP_DIR
\`\`\`

### Disaster Recovery
1. **Database Replication**: MongoDB replica sets
2. **Cross-Region Backup**: Store backups in multiple regions
3. **Recovery Testing**: Regular recovery drills
4. **Documentation**: Clear recovery procedures

## Troubleshooting

### Common Issues

#### Database Connection Issues
\`\`\`bash
# Check MongoDB connection
mongo $MONGODB_URI --eval "db.adminCommand('ismaster')"

# Check network connectivity
telnet mongodb-host 27017
\`\`\`

#### AI Provider API Issues
\`\`\`bash
# Test OpenAI connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Test Anthropic connection
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/messages
\`\`\`

#### Trust Protocol Issues
\`\`\`bash
# Check cryptographic key generation
node -e "console.log(require('crypto').generateKeyPairSync('rsa', {modulusLength: 2048}))"

# Verify JWKS endpoint
curl http://localhost:5000/api/trust-protocol/jwks
\`\`\`

### Log Analysis
\`\`\`bash
# Search for errors
grep -i error /var/log/symbi/*.log

# Monitor real-time logs
tail -f /var/log/symbi/combined.log

# Analyze trust protocol operations
grep "trust-protocol" /var/log/symbi/combined.log | jq .
\`\`\`

## Support and Maintenance

### Regular Maintenance Tasks
1. **Security Updates**: Keep dependencies updated
2. **Certificate Renewal**: Automate SSL certificate renewal
3. **Database Maintenance**: Index optimization, cleanup old data
4. **Monitoring Review**: Check metrics and alerts
5. **Backup Verification**: Test backup integrity

### Support Contacts
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: security@symbi-trust-protocol.com
- **General Support**: support@symbi-trust-protocol.com

## Conclusion

The SYMBI Trust Protocol platform is designed for enterprise-grade deployment with comprehensive security, monitoring, and scaling capabilities. Follow this guide for successful deployment and operation of your sovereign AI trust management system.

For additional support or custom deployment requirements, please contact our technical team.
\`\`\`

\`\`\`json file="" isHidden
