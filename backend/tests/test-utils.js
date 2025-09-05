const request = require('supertest');

/**
 * Mock authentication middleware for testing
 * @param {string} userId - User ID to mock
 */
const mockAuthMiddleware = (userId = 'testUserId') => {
  jest.mock('../middleware/auth.middleware', () => ({
    protect: jest.fn((req, res, next) => {
      req.user = { id: userId };
      next();
    })
  }));
};

/**
 * Create a test user object
 * @param {string} id - User ID
 * @param {Object} additionalProps - Additional user properties
 * @returns {Object} Mock user object
 */
const createMockUser = (userId = 'testUserId') => ({
  id: userId,
  email: 'test@example.com',
  name: 'Test User'
});

/**
 * Common test setup for integration tests
 * @param {Object} model - Mongoose model to clear
 * @param {string} userId - User ID for auth mock
 */
const setupIntegrationTest = async (model, userId = 'testUserId') => {
  // Mock auth middleware
  mockAuthMiddleware(userId);
  
  // Clear the model data
  if (model && model.deleteMany) {
    await model.deleteMany({});
  }
};

/**
 * Create sample data for testing
 * @param {Object} model - Mongoose model
 * @param {Array} data - Array of data objects to create
 * @returns {Promise<Array>} Created documents
 */
const createSampleData = async (model, data) => {
  return await model.create(data);
};

/**
 * Common assertions for API responses
 */
const commonAssertions = {
  /**
   * Assert paginated response structure
   * @param {Object} response - API response body
   * @param {number} expectedCount - Expected number of items
   */
  assertPaginatedResponse: (response, expectedCount) => {
    expect(response).toHaveProperty('totalPages');
    if (expectedCount !== undefined) {
      expect(response.contexts?.length || response.reports?.length).toBe(expectedCount);
    }
  },

  /**
   * Assert created resource response
   * @param {Object} response - API response body
   * @param {Object} expectedData - Expected data properties
   */
  assertCreatedResource: (response, expectedData) => {
    expect(response).toHaveProperty('_id');
    Object.keys(expectedData).forEach(key => {
      expect(response[key]).toBe(expectedData[key]);
    });
  }
};

module.exports = {
  mockAuthMiddleware,
  createMockUser,
  setupIntegrationTest,
  createSampleData,
  commonAssertions
};