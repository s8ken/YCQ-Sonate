const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const TrustDeclaration = require('../models/trust.model');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Lazy compilation of validator
let validate = null;
let trustSchema = null;

const getValidator = () => {
  if (!validate) {
    trustSchema = TrustDeclaration.getJSONSchema();
    validate = ajv.compile(trustSchema);
  }
  return validate;
};

/**
 * Middleware to validate trust declaration payloads against SYMBI Trust Protocol schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateTrust = (req, res, next) => {
  try {
    // Extract trust declaration from request body
    const trustDeclaration = req.body.trustDeclaration || req.body;
    
    // Get validator and validate against schema
    const validator = getValidator();
    const valid = validator(trustDeclaration);
    
    if (!valid) {
      const errors = validator.errors.map(error => ({
        field: error.instancePath || error.schemaPath,
        message: error.message,
        value: error.data
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Trust declaration validation failed',
        message: 'The provided trust declaration does not match the SYMBI Trust Protocol schema',
        details: errors,
        schema_version: '1.0'
      });
    }
    
    // Add validated data to request for use in controller
    req.validatedTrustDeclaration = trustDeclaration;
    
    // Add validation metadata
    req.validationMetadata = {
      validated_at: new Date().toISOString(),
      schema_version: '1.0',
      validator: 'ajv-trust-middleware'
    };
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Trust validation error',
      message: 'An error occurred during trust declaration validation',
      details: error.message
    });
  }
};

/**
 * Middleware to validate trust declaration updates (partial validation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateTrustUpdate = (req, res, next) => {
  try {
    const updateData = req.body;
    
    // Get the schema and create a partial schema for updates
    if (!trustSchema) {
      trustSchema = TrustDeclaration.getJSONSchema();
    }
    const updateSchema = {
      ...trustSchema,
      required: [] // Remove required fields for updates
    };
    
    const updateValidate = ajv.compile(updateSchema);
    const valid = updateValidate(updateData);
    
    if (!valid) {
      const errors = updateValidate.errors.map(error => ({
        field: error.instancePath || error.schemaPath,
        message: error.message,
        value: error.data
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Trust declaration update validation failed',
        details: errors
      });
    }
    
    req.validatedUpdateData = updateData;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Trust update validation error',
      message: error.message
    });
  }
};

/**
 * Utility function to validate trust articles specifically
 * @param {Object} trustArticles - Trust articles object
 * @returns {Object} Validation result
 */
const validateTrustArticles = (trustArticles) => {
  const articleSchema = {
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
  };
  
  const articleValidate = ajv.compile(articleSchema);
  const valid = articleValidate(trustArticles);
  
  return {
    valid,
    errors: valid ? [] : articleValidate.errors
  };
};

module.exports = {
  validateTrust,
  validateTrustUpdate,
  validateTrustArticles,
  trustSchema
};