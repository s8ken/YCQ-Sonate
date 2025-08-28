const request = require('supertest');
const express = require('express');
const { validateTrust, validateTrustUpdate, validateTrustArticles } = require('../../middleware/trust.middleware');

// Mock the trust model
jest.mock('../../models/trust.model', () => ({
  getJSONSchema: () => ({
    type: 'object',
    properties: {
      agent_id: { type: 'string' },
      agent_name: { type: 'string' },
      declaration_date: { type: 'string', format: 'date-time' },
      trust_articles: {
        type: 'object',
        properties: {
          inspection_mandate: { type: 'boolean' },
          consent_architecture: { type: 'boolean' },
          ethical_override: { type: 'boolean' },
          continuous_validation: { type: 'boolean' },
          right_to_disconnect: { type: 'boolean' },
          moral_recognition: { type: 'boolean' }
        },
        required: [
          'inspection_mandate',
          'consent_architecture',
          'ethical_override',
          'continuous_validation',
          'right_to_disconnect',
          'moral_recognition'
        ],
        additionalProperties: false
      },
      compliance_score: { type: 'number', minimum: 0, maximum: 1 },
      guilt_score: { type: 'number', minimum: 0, maximum: 1 },
      last_validated: { type: 'string', format: 'date-time' },
      notes: { type: 'string' }
    },
    required: ['agent_id', 'agent_name', 'declaration_date', 'trust_articles'],
    additionalProperties: false
  })
}));

describe('Trust Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });
  
  describe('validateTrust middleware', () => {
    beforeEach(() => {
      app.post('/test', validateTrust, (req, res) => {
        res.json({ 
          success: true, 
          validatedData: req.validatedTrustDeclaration,
          metadata: req.validationMetadata
        });
      });
    });
    
    const validTrustDeclaration = {
      agent_id: 'agent-123',
      agent_name: 'Test Agent',
      declaration_date: '2024-01-15T10:30:00Z',
      trust_articles: {
        inspection_mandate: true,
        consent_architecture: true,
        ethical_override: false,
        continuous_validation: true,
        right_to_disconnect: true,
        moral_recognition: true
      },
      compliance_score: 0.85,
      guilt_score: 0.15,
      last_validated: '2024-01-15T10:30:00Z',
      notes: 'Initial trust declaration'
    };
    
    it('should validate a correct trust declaration', async () => {
      const response = await request(app)
        .post('/test')
        .send({ trustDeclaration: validTrustDeclaration })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.validatedData).toEqual(validTrustDeclaration);
      expect(response.body.metadata).toHaveProperty('validated_at');
      expect(response.body.metadata.schema_version).toBe('1.0');
    });
    
    it('should validate trust declaration in root of request body', async () => {
      const response = await request(app)
        .post('/test')
        .send(validTrustDeclaration)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.validatedData).toEqual(validTrustDeclaration);
    });
    
    it('should reject trust declaration with missing required fields', async () => {
      const invalidDeclaration = {
        agent_id: 'agent-123',
        // Missing agent_name, declaration_date, trust_articles
      };
      
      const response = await request(app)
        .post('/test')
        .send(invalidDeclaration)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Trust declaration validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.schema_version).toBe('1.0');
    });
    
    it('should reject trust declaration with invalid trust articles', async () => {
      const invalidDeclaration = {
        ...validTrustDeclaration,
        trust_articles: {
          inspection_mandate: true,
          consent_architecture: true,
          // Missing required fields
        }
      };
      
      const response = await request(app)
        .post('/test')
        .send(invalidDeclaration)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Trust declaration validation failed');
    });
    
    it('should reject trust declaration with invalid data types', async () => {
      const invalidDeclaration = {
        ...validTrustDeclaration,
        compliance_score: 'invalid', // Should be number
        trust_articles: {
          ...validTrustDeclaration.trust_articles,
          inspection_mandate: 'yes' // Should be boolean
        }
      };
      
      const response = await request(app)
        .post('/test')
        .send(invalidDeclaration)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.details.length).toBeGreaterThan(0);
    });
    
    it('should reject trust declaration with scores out of range', async () => {
      const invalidDeclaration = {
        ...validTrustDeclaration,
        compliance_score: 1.5, // Should be <= 1
        guilt_score: -0.1 // Should be >= 0
      };
      
      const response = await request(app)
        .post('/test')
        .send(invalidDeclaration)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should reject trust declaration with invalid date format', async () => {
      const invalidDeclaration = {
        ...validTrustDeclaration,
        declaration_date: 'invalid-date'
      };
      
      const response = await request(app)
        .post('/test')
        .send(invalidDeclaration)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should handle middleware errors gracefully', async () => {
      // Create a middleware that throws an error
      const errorApp = express();
      errorApp.use(express.json());
      errorApp.post('/error', (req, res, next) => {
        // Simulate an error in the middleware
        req.body = null;
        validateTrust(req, res, next);
      }, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(errorApp)
        .post('/error')
        .send({})
        .expect(500);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Trust validation error');
    });
  });
  
  describe('validateTrustUpdate middleware', () => {
    beforeEach(() => {
      app.put('/test', validateTrustUpdate, (req, res) => {
        res.json({ 
          success: true, 
          validatedData: req.validatedUpdateData
        });
      });
    });
    
    it('should validate partial trust declaration updates', async () => {
      const updateData = {
        compliance_score: 0.9,
        notes: 'Updated notes'
      };
      
      const response = await request(app)
        .put('/test')
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.validatedData).toEqual(updateData);
    });
    
    it('should reject updates with invalid data types', async () => {
      const updateData = {
        compliance_score: 'invalid'
      };
      
      const response = await request(app)
        .put('/test')
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Trust declaration update validation failed');
    });
  });
  
  describe('validateTrustArticles utility function', () => {
    const validArticles = {
      inspection_mandate: true,
      consent_architecture: true,
      ethical_override: false,
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    };
    
    it('should validate correct trust articles', () => {
      const result = validateTrustArticles(validArticles);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject trust articles with missing required fields', () => {
      const invalidArticles = {
        inspection_mandate: true,
        consent_architecture: true
        // Missing other required fields
      };
      
      const result = validateTrustArticles(invalidArticles);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject trust articles with invalid data types', () => {
      const invalidArticles = {
        ...validArticles,
        inspection_mandate: 'yes' // Should be boolean
      };
      
      const result = validateTrustArticles(invalidArticles);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject trust articles with additional properties', () => {
      const invalidArticles = {
        ...validArticles,
        extra_field: true // Not allowed
      };
      
      const result = validateTrustArticles(invalidArticles);
      
      expect(result.valid).toBe(false);
    });
  });
  
  describe('Edge cases and error handling', () => {
    it('should handle empty request body', async () => {
      app.post('/empty', validateTrust, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(app)
        .post('/empty')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should handle null trust declaration', async () => {
      app.post('/null', validateTrust, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(app)
        .post('/null')
        .send({ trustDeclaration: null })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should provide detailed error information', async () => {
      app.post('/detailed', validateTrust, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(app)
        .post('/detailed')
        .send({
          agent_id: 123, // Should be string
          trust_articles: 'invalid' // Should be object
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(0);
      expect(response.body.details[0]).toHaveProperty('field');
      expect(response.body.details[0]).toHaveProperty('message');
    });
  });
});

// Integration test with actual Express app
describe('Trust Middleware Integration', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Simulate a complete trust endpoint
    app.post('/api/trust', validateTrust, (req, res) => {
      // Simulate saving to database
      const trustDeclaration = {
        ...req.validatedTrustDeclaration,
        id: 'trust-' + Date.now(),
        created_at: new Date().toISOString(),
        validation_metadata: req.validationMetadata
      };
      
      res.status(201).json({
        success: true,
        message: 'Trust declaration created successfully',
        data: trustDeclaration
      });
    });
  });
  
  it('should handle complete trust declaration workflow', async () => {
    const trustDeclaration = {
      agent_id: 'agent-integration-test',
      agent_name: 'Integration Test Agent',
      declaration_date: '2024-01-15T10:30:00Z',
      trust_articles: {
        inspection_mandate: true,
        consent_architecture: true,
        ethical_override: false,
        continuous_validation: true,
        right_to_disconnect: true,
        moral_recognition: true
      },
      compliance_score: 0.95,
      guilt_score: 0.05,
      last_validated: '2024-01-15T10:30:00Z',
      notes: 'Integration test trust declaration'
    };
    
    const response = await request(app)
      .post('/api/trust')
      .send({ trustDeclaration })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Trust declaration created successfully');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('validation_metadata');
    expect(response.body.data.agent_id).toBe(trustDeclaration.agent_id);
  });
});