const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Helper function to create JWT token for testing
const createTestJWT = (userData) => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(userData, secret, { expiresIn: '1h' });
};

// Helper function to get user JWT with specific role
const getUserJwt = async (userProps = {}) => {
  const defaultUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    roles: ['user'],
    ...userProps
  };
  
  return createTestJWT(defaultUser);
};

describe('Trust RBAC', () => {
  let userToken;
  let adminToken;
  
  beforeAll(async () => {
    // Create tokens for different user types
    userToken = await getUserJwt({ role: 'user', roles: ['user'] });
    adminToken = await getUserJwt({ role: 'admin', roles: ['admin'] });
  });

  describe('POST /api/trust/:id/audit', () => {
    it('should block non-admin users from auditing trust declarations', async () => {
      const res = await request(app)
        .post('/api/trust/507f1f77bcf86cd799439011/audit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          auditType: 'compliance_check',
          notes: 'Test audit'
        });
      
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Insufficient permissions');
      expect(res.body.message).toContain('Required roles: admin');
    });

    it('should allow admin users to audit trust declarations', async () => {
      const res = await request(app)
        .post('/api/trust/507f1f77bcf86cd799439011/audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          auditType: 'compliance_check',
          notes: 'Test audit'
        });
      
      // Note: This might return 404 if trust declaration doesn't exist,
      // but it should NOT return 403 (forbidden)
      expect(res.status).not.toBe(403);
    });
  });

  describe('DELETE /api/trust/:id', () => {
    it('should block non-admin users from deleting trust declarations', async () => {
      const res = await request(app)
        .delete('/api/trust/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Insufficient permissions');
      expect(res.body.message).toContain('Required roles: admin');
    });

    it('should allow admin users to delete trust declarations', async () => {
      const res = await request(app)
        .delete('/api/trust/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Note: This might return 404 if trust declaration doesn't exist,
      // but it should NOT return 403 (forbidden)
      expect(res.status).not.toBe(403);
    });
  });

  describe('PUT /api/trust/:id', () => {
    it('should block non-admin users from updating trust declarations', async () => {
      const res = await request(app)
        .put('/api/trust/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trustDeclaration: {
            agent_id: 'test-agent',
            agent_name: 'Test Agent',
            compliance_score: 0.8
          }
        });
      
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Insufficient permissions');
      expect(res.body.message).toContain('Required roles: admin');
    });

    it('should allow admin users to update trust declarations', async () => {
      const res = await request(app)
        .put('/api/trust/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          trustDeclaration: {
            agent_id: 'test-agent',
            agent_name: 'Test Agent',
            compliance_score: 0.8
          }
        });
      
      // Note: This might return 404 if trust declaration doesn't exist,
      // but it should NOT return 403 (forbidden)
      expect(res.status).not.toBe(403);
    });
  });

  describe('Non-restricted endpoints', () => {
    it('should allow regular users to read trust declarations', async () => {
      const res = await request(app)
        .get('/api/trust')
        .set('Authorization', `Bearer ${userToken}`);
      
      // Should not be forbidden (might be 200 or other status, but not 403)
      expect(res.status).not.toBe(403);
    });

    it('should allow regular users to create trust declarations', async () => {
      const res = await request(app)
        .post('/api/trust')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trustDeclaration: {
            agent_id: 'test-agent',
            agent_name: 'Test Agent',
            compliance_score: 0.8,
            guilt_score: 0.2
          }
        });
      
      // Should not be forbidden (might be 200, 400, or other status, but not 403)
      expect(res.status).not.toBe(403);
    });
  });

  describe('Unauthenticated requests', () => {
    it('should require authentication for all trust endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/trust' },
        { method: 'post', path: '/api/trust' },
        { method: 'get', path: '/api/trust/507f1f77bcf86cd799439011' },
        { method: 'put', path: '/api/trust/507f1f77bcf86cd799439011' },
        { method: 'delete', path: '/api/trust/507f1f77bcf86cd799439011' },
        { method: 'post', path: '/api/trust/507f1f77bcf86cd799439011/audit' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)[endpoint.method](endpoint.path);
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Not authorized');
      }
    });
  });
});