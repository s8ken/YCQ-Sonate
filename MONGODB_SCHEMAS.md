# MongoDB Collection Schemas

This document defines the MongoDB collection schemas for the Symbi Trust Protocol, including compound indexes, TTL configurations, and data validation rules.

## Collections Overview

- **users**: User accounts and authentication data
- **agents**: AI agent profiles and metadata
- **trust_declarations**: Trust relationships between agents
- **conversations**: Chat history and context
- **contexts**: Conversation context and state
- **reports**: Audit reports and compliance data
- **audit_events**: Security and system events
- **sessions**: User session management
- **verification_credentials**: DID/VC storage

## Collection Schemas

### 1. Users Collection

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "role", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
          description: "Valid email address"
        },
        passwordHash: {
          bsonType: "string",
          minLength: 60,
          description: "Bcrypt hashed password"
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin", "moderator"],
          description: "User role for RBAC"
        },
        profile: {
          bsonType: "object",
          properties: {
            firstName: { bsonType: "string", maxLength: 50 },
            lastName: { bsonType: "string", maxLength: 50 },
            avatar: { bsonType: "string" },
            bio: { bsonType: "string", maxLength: 500 }
          }
        },
        preferences: {
          bsonType: "object",
          properties: {
            notifications: { bsonType: "bool" },
            theme: { bsonType: "string", enum: ["light", "dark"] },
            language: { bsonType: "string" }
          }
        },
        security: {
          bsonType: "object",
          properties: {
            twoFactorEnabled: { bsonType: "bool" },
            lastPasswordChange: { bsonType: "date" },
            failedLoginAttempts: { bsonType: "int", minimum: 0 },
            accountLocked: { bsonType: "bool" },
            lockoutUntil: { bsonType: "date" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastLoginAt: { bsonType: "date" },
        isActive: { bsonType: "bool", description: "Account status" }
      }
    }
  }
});

// Indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "lastLoginAt": 1 });
db.users.createIndex({ "security.accountLocked": 1, "security.lockoutUntil": 1 });
```

### 2. Agents Collection

```javascript
db.createCollection("agents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "type", "ownerId", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "Agent display name"
        },
        type: {
          bsonType: "string",
          enum: ["chatbot", "assistant", "analyzer", "moderator"],
          description: "Agent type classification"
        },
        ownerId: {
          bsonType: "objectId",
          description: "Reference to users collection"
        },
        did: {
          bsonType: "string",
          pattern: "^did:[a-z0-9]+:[a-zA-Z0-9._-]+$",
          description: "Decentralized Identifier"
        },
        capabilities: {
          bsonType: "array",
          items: {
            bsonType: "string",
            enum: ["text_generation", "image_analysis", "code_review", "translation"]
          }
        },
        configuration: {
          bsonType: "object",
          properties: {
            model: { bsonType: "string" },
            temperature: { bsonType: "double", minimum: 0, maximum: 2 },
            maxTokens: { bsonType: "int", minimum: 1, maximum: 32000 },
            systemPrompt: { bsonType: "string", maxLength: 2000 }
          }
        },
        trustScore: {
          bsonType: "object",
          properties: {
            current: { bsonType: "double", minimum: 0, maximum: 1 },
            history: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  score: { bsonType: "double" },
                  timestamp: { bsonType: "date" },
                  reason: { bsonType: "string" }
                }
              }
            }
          }
        },
        metadata: {
          bsonType: "object",
          properties: {
            version: { bsonType: "string" },
            description: { bsonType: "string", maxLength: 500 },
            tags: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Indexes for agents collection
db.agents.createIndex({ "ownerId": 1 });
db.agents.createIndex({ "type": 1 });
db.agents.createIndex({ "did": 1 }, { unique: true, sparse: true });
db.agents.createIndex({ "trustScore.current": -1 });
db.agents.createIndex({ "createdAt": 1 });
db.agents.createIndex({ "name": "text", "metadata.description": "text" });
db.agents.createIndex({ "ownerId": 1, "isActive": 1 });
```

### 3. Trust Declarations Collection

```javascript
db.createCollection("trust_declarations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["declarerId", "targetAgentId", "trustLevel", "context", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        declarerId: {
          bsonType: "objectId",
          description: "User making the declaration"
        },
        targetAgentId: {
          bsonType: "objectId",
          description: "Agent being evaluated"
        },
        trustLevel: {
          bsonType: "double",
          minimum: 0,
          maximum: 1,
          description: "Trust score from 0 to 1"
        },
        context: {
          bsonType: "string",
          enum: ["general", "technical", "creative", "analytical", "safety"],
          description: "Context of trust evaluation"
        },
        evidence: {
          bsonType: "object",
          properties: {
            interactionCount: { bsonType: "int", minimum: 0 },
            successRate: { bsonType: "double", minimum: 0, maximum: 1 },
            averageResponseTime: { bsonType: "double", minimum: 0 },
            qualityRating: { bsonType: "double", minimum: 0, maximum: 5 },
            notes: { bsonType: "string", maxLength: 1000 }
          }
        },
        verification: {
          bsonType: "object",
          properties: {
            method: {
              bsonType: "string",
              enum: ["direct_interaction", "peer_review", "automated_test"]
            },
            verifiedAt: { bsonType: "date" },
            verifierId: { bsonType: "objectId" },
            signature: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Indexes for trust_declarations collection
db.trust_declarations.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.trust_declarations.createIndex({ "declarerId": 1, "targetAgentId": 1 });
db.trust_declarations.createIndex({ "targetAgentId": 1, "trustLevel": -1 });
db.trust_declarations.createIndex({ "context": 1, "trustLevel": -1 });
db.trust_declarations.createIndex({ "createdAt": 1 });
db.trust_declarations.createIndex({ "isActive": 1, "expiresAt": 1 });
```

### 4. Conversations Collection

```javascript
db.createCollection("conversations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["participants", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        participants: {
          bsonType: "array",
          minItems: 2,
          items: {
            bsonType: "object",
            required: ["id", "type"],
            properties: {
              id: { bsonType: "objectId" },
              type: {
                bsonType: "string",
                enum: ["user", "agent"]
              },
              role: {
                bsonType: "string",
                enum: ["initiator", "responder", "observer"]
              }
            }
          }
        },
        messages: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["senderId", "content", "timestamp"],
            properties: {
              _id: { bsonType: "objectId" },
              senderId: { bsonType: "objectId" },
              senderType: {
                bsonType: "string",
                enum: ["user", "agent"]
              },
              content: {
                bsonType: "object",
                properties: {
                  text: { bsonType: "string", maxLength: 10000 },
                  type: {
                    bsonType: "string",
                    enum: ["text", "image", "file", "code"]
                  },
                  metadata: { bsonType: "object" }
                }
              },
              timestamp: { bsonType: "date" },
              edited: { bsonType: "bool" },
              editedAt: { bsonType: "date" }
            }
          }
        },
        metadata: {
          bsonType: "object",
          properties: {
            title: { bsonType: "string", maxLength: 200 },
            topic: { bsonType: "string" },
            priority: {
              bsonType: "string",
              enum: ["low", "normal", "high", "urgent"]
            },
            tags: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        },
        status: {
          bsonType: "string",
          enum: ["active", "paused", "completed", "archived"]
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastMessageAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes for conversations collection
db.conversations.createIndex({ "participants.id": 1 });
db.conversations.createIndex({ "lastMessageAt": -1 });
db.conversations.createIndex({ "status": 1, "updatedAt": -1 });
db.conversations.createIndex({ "createdAt": 1 });
db.conversations.createIndex({ "metadata.tags": 1 });
db.conversations.createIndex({ "participants.id": 1, "status": 1 });
```

### 5. Contexts Collection

```javascript
db.createCollection("contexts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["conversationId", "agentId", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        conversationId: {
          bsonType: "objectId",
          description: "Reference to conversation"
        },
        agentId: {
          bsonType: "objectId",
          description: "Agent this context belongs to"
        },
        contextData: {
          bsonType: "object",
          properties: {
            memory: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  key: { bsonType: "string" },
                  value: { bsonType: "string" },
                  importance: { bsonType: "double", minimum: 0, maximum: 1 },
                  timestamp: { bsonType: "date" }
                }
              }
            },
            preferences: { bsonType: "object" },
            state: { bsonType: "object" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes for contexts collection
db.contexts.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.contexts.createIndex({ "conversationId": 1, "agentId": 1 }, { unique: true });
db.contexts.createIndex({ "agentId": 1 });
db.contexts.createIndex({ "updatedAt": 1 });
```

### 6. Reports Collection

```javascript
db.createCollection("reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "generatedBy", "data", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        type: {
          bsonType: "string",
          enum: ["trust_analysis", "compliance_audit", "security_scan", "performance_report"]
        },
        generatedBy: {
          bsonType: "objectId",
          description: "User or agent that generated report"
        },
        scope: {
          bsonType: "object",
          properties: {
            agentIds: {
              bsonType: "array",
              items: { bsonType: "objectId" }
            },
            timeRange: {
              bsonType: "object",
              properties: {
                start: { bsonType: "date" },
                end: { bsonType: "date" }
              }
            },
            filters: { bsonType: "object" }
          }
        },
        data: {
          bsonType: "object",
          properties: {
            summary: { bsonType: "string" },
            metrics: { bsonType: "object" },
            findings: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  severity: {
                    bsonType: "string",
                    enum: ["low", "medium", "high", "critical"]
                  },
                  category: { bsonType: "string" },
                  description: { bsonType: "string" },
                  recommendation: { bsonType: "string" }
                }
              }
            },
            attachments: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  filename: { bsonType: "string" },
                  contentType: { bsonType: "string" },
                  size: { bsonType: "int" },
                  url: { bsonType: "string" }
                }
              }
            }
          }
        },
        status: {
          bsonType: "string",
          enum: ["generating", "completed", "failed", "archived"]
        },
        createdAt: { bsonType: "date" },
        completedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes for reports collection
db.reports.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.reports.createIndex({ "type": 1, "createdAt": -1 });
db.reports.createIndex({ "generatedBy": 1 });
db.reports.createIndex({ "status": 1 });
db.reports.createIndex({ "scope.agentIds": 1 });
```

### 7. Audit Events Collection

```javascript
db.createCollection("audit_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventType", "severity", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        eventType: {
          bsonType: "string",
          enum: [
            "user_login", "user_logout", "password_change", "account_locked",
            "trust_declaration_created", "trust_declaration_updated",
            "agent_created", "agent_modified", "agent_deleted",
            "security_violation", "suspicious_activity", "rate_limit_exceeded",
            "data_access", "data_modification", "system_error"
          ]
        },
        severity: {
          bsonType: "string",
          enum: ["info", "warning", "error", "critical"]
        },
        actor: {
          bsonType: "object",
          properties: {
            id: { bsonType: "objectId" },
            type: {
              bsonType: "string",
              enum: ["user", "agent", "system"]
            },
            ip: { bsonType: "string" },
            userAgent: { bsonType: "string" }
          }
        },
        target: {
          bsonType: "object",
          properties: {
            id: { bsonType: "objectId" },
            type: {
              bsonType: "string",
              enum: ["user", "agent", "conversation", "trust_declaration", "report"]
            },
            resource: { bsonType: "string" }
          }
        },
        details: {
          bsonType: "object",
          properties: {
            action: { bsonType: "string" },
            result: {
              bsonType: "string",
              enum: ["success", "failure", "partial"]
            },
            errorCode: { bsonType: "string" },
            message: { bsonType: "string" },
            metadata: { bsonType: "object" }
          }
        },
        timestamp: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes for audit_events collection
db.audit_events.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.audit_events.createIndex({ "eventType": 1, "timestamp": -1 });
db.audit_events.createIndex({ "severity": 1, "timestamp": -1 });
db.audit_events.createIndex({ "actor.id": 1, "timestamp": -1 });
db.audit_events.createIndex({ "target.id": 1, "timestamp": -1 });
db.audit_events.createIndex({ "timestamp": -1 });
```

### 8. Sessions Collection

```javascript
db.createCollection("sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "sessionId", "createdAt", "expiresAt"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: {
          bsonType: "objectId",
          description: "Reference to user"
        },
        sessionId: {
          bsonType: "string",
          minLength: 32,
          description: "Unique session identifier"
        },
        data: {
          bsonType: "object",
          properties: {
            ip: { bsonType: "string" },
            userAgent: { bsonType: "string" },
            lastActivity: { bsonType: "date" },
            preferences: { bsonType: "object" }
          }
        },
        createdAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Indexes for sessions collection
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ "sessionId": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "isActive": 1, "data.lastActivity": -1 });
```

### 9. Verification Credentials Collection

```javascript
db.createCollection("verification_credentials", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["credentialId", "type", "issuer", "subject", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        credentialId: {
          bsonType: "string",
          description: "Unique credential identifier"
        },
        type: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Credential types"
        },
        issuer: {
          bsonType: "object",
          required: ["id"],
          properties: {
            id: { bsonType: "string" },
            name: { bsonType: "string" },
            publicKey: { bsonType: "string" }
          }
        },
        subject: {
          bsonType: "object",
          required: ["id"],
          properties: {
            id: { bsonType: "string" },
            agentId: { bsonType: "objectId" },
            claims: { bsonType: "object" }
          }
        },
        credentialSubject: {
          bsonType: "object",
          description: "The actual credential data"
        },
        proof: {
          bsonType: "object",
          required: ["type", "created", "proofValue"],
          properties: {
            type: { bsonType: "string" },
            created: { bsonType: "date" },
            verificationMethod: { bsonType: "string" },
            proofPurpose: { bsonType: "string" },
            proofValue: { bsonType: "string" }
          }
        },
        status: {
          bsonType: "string",
          enum: ["active", "revoked", "suspended", "expired"]
        },
        createdAt: { bsonType: "date" },
        issuedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        revokedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes for verification_credentials collection
db.verification_credentials.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.verification_credentials.createIndex({ "credentialId": 1 }, { unique: true });
db.verification_credentials.createIndex({ "subject.agentId": 1 });
db.verification_credentials.createIndex({ "issuer.id": 1 });
db.verification_credentials.createIndex({ "status": 1, "expiresAt": 1 });
db.verification_credentials.createIndex({ "type": 1 });
```

## TTL (Time To Live) Configurations

### Automatic Data Cleanup

```javascript
// Trust declarations expire after 1 year
db.trust_declarations.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 31536000 } // 365 days
);

// Audit events expire after 2 years for compliance
db.audit_events.createIndex(
  { "timestamp": 1 },
  { expireAfterSeconds: 63072000 } // 730 days
);

// Sessions expire after 30 days of inactivity
db.sessions.createIndex(
  { "data.lastActivity": 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);

// Context data expires after 90 days
db.contexts.createIndex(
  { "updatedAt": 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

// Reports expire after 1 year
db.reports.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 31536000 } // 365 days
);
```

## Compound Indexes for Performance

### High-Performance Query Patterns

```javascript
// Trust analysis queries
db.trust_declarations.createIndex({
  "targetAgentId": 1,
  "context": 1,
  "trustLevel": -1,
  "createdAt": -1
});

// User activity tracking
db.audit_events.createIndex({
  "actor.id": 1,
  "eventType": 1,
  "timestamp": -1
});

// Conversation search and filtering
db.conversations.createIndex({
  "participants.id": 1,
  "status": 1,
  "lastMessageAt": -1
});

// Agent performance analysis
db.agents.createIndex({
  "ownerId": 1,
  "type": 1,
  "trustScore.current": -1,
  "isActive": 1
});

// Security monitoring
db.audit_events.createIndex({
  "severity": 1,
  "eventType": 1,
  "timestamp": -1
});
```

## Data Retention Policies

### Compliance and Storage Management

1. **Personal Data**: User profiles and personal information retained indefinitely until account deletion
2. **Trust Declarations**: Automatically expire after 1 year unless renewed
3. **Audit Logs**: Retained for 2 years for compliance requirements
4. **Session Data**: Expires after 30 days of inactivity
5. **Conversation History**: Retained indefinitely unless explicitly deleted by users
6. **Context Data**: Expires after 90 days to manage storage costs
7. **Reports**: Archived after 1 year, deleted after 3 years
8. **Verification Credentials**: Expire based on issuer-defined expiration dates

## Database Administration

### Monitoring and Maintenance

```javascript
// Check index usage
db.runCommand({ "collStats": "trust_declarations", "indexDetails": true });

// Monitor TTL deletions
db.runCommand({ "serverStatus": 1 }).metrics.ttl;

// Analyze query performance
db.trust_declarations.explain("executionStats").find({
  "targetAgentId": ObjectId("..."),
  "context": "technical"
});

// Compact collections to reclaim space
db.runCommand({ "compact": "audit_events" });
```

### Backup Strategy

- **Full backups**: Daily at 2 AM UTC
- **Incremental backups**: Every 6 hours
- **Point-in-time recovery**: Enabled with oplog
- **Cross-region replication**: Primary in US-East, Secondary in EU-West
- **Backup retention**: 30 days for daily, 12 months for weekly

## Security Considerations

1. **Field-level encryption** for sensitive data (passwords, personal info)
2. **Role-based access control** with principle of least privilege
3. **Audit logging** for all data access and modifications
4. **Network encryption** with TLS 1.3
5. **Regular security updates** and vulnerability assessments
6. **Data anonymization** for analytics and reporting

---

*This schema documentation should be reviewed and updated quarterly to ensure alignment with application requirements and compliance standards.*