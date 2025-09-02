const request = require('supertest');
const app = require('../../app');
const Report = require('../../models/report.model');

// Mock auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'testUserId' };
    next();
  })
}));

describe('Reports API Integration Tests', () => {
  beforeEach(async () => {
    await Report.deleteMany({});
  });

  it('should get all reports', async () => {
    // Create sample reports
    await Report.create([
      { category: 'daily', title: 'Report 1', content: 'Content 1' },
      { category: 'daily', title: 'Report 2', content: 'Content 2' }
    ]);

    const res = await request(app)
      .get('/api/reports')
      .expect(200);

    expect(res.body).toHaveProperty('reports');
    expect(Array.isArray(res.body.reports)).toBe(true);
    expect(res.body.reports).toHaveLength(2);
  });

  it('should create a new report', async () => {
    const newReport = {
      category: 'weekly',
      title: 'New Report',
      content: 'New content'
    };

    const res = await request(app)
      .post('/api/reports')
      .send(newReport)
      .expect(201);

    expect(res.body).toHaveProperty('title', newReport.title);
    expect(res.body).toHaveProperty('_id');
  });

  // Add more tests for other endpoints as needed
});