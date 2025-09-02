const request = require('supertest');
const app = require('../../app');
const Context = require('../../models/context.model');

// Mock auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'testUserId' };
    next();
  })
}));

describe('Context API Integration Tests', () => {
  beforeEach(async () => {
    await Context.deleteMany({});
  });

  it('should get all contexts', async () => {
    // Create sample contexts
    await Context.create([
      { tag: 'tag1', source: 'symbi', data: { key: 'value1' }, user: 'testUserId' },
      { tag: 'tag2', source: 'symbi', data: { key: 'value2' }, user: 'testUserId' }
    ]);

    const res = await request(app)
      .get('/api/context')
      .expect(200);

    expect(res.body).toHaveProperty('contexts');
    expect(Array.isArray(res.body.contexts)).toBe(true);
    expect(res.body.contexts).toHaveLength(2);
  });

  it('should create a new context', async () => {
    const newContext = {
      tag: 'new-tag',
      source: 'symbi',
      data: { key: 'new-value' }
    };

    const res = await request(app)
      .post('/api/context')
      .send(newContext)
      .expect(201);

    expect(res.body).toHaveProperty('tag', newContext.tag);
    expect(res.body).toHaveProperty('_id');
  });

  // Add more tests for other context endpoints as needed
});
