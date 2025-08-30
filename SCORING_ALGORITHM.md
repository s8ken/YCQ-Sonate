# Symbi Trust Protocol - Scoring Algorithm Documentation

## Overview

The Symbi Trust Protocol employs a sophisticated scoring algorithm to calculate trust scores based on multiple weighted factors, temporal decay, and confidence intervals. This document provides a comprehensive explanation of the algorithm's components, implementation, and behavior.

## Algorithm Components

### 1. Input Factors

The scoring algorithm considers the following input factors:

#### Primary Factors (High Weight)
- **Declaration Volume** (`declaration_count`): Number of trust declarations received
- **Declaration Quality** (`quality_score`): Average quality rating of declarations (0-1)
- **Issuer Reputation** (`issuer_reputation`): Weighted reputation of declaration issuers (0-1)
- **Verification Status** (`verification_rate`): Percentage of verified declarations (0-1)

#### Secondary Factors (Medium Weight)
- **Temporal Consistency** (`consistency_score`): Consistency of declarations over time (0-1)
- **Network Effects** (`network_score`): Trust propagation through network connections (0-1)
- **Diversity Index** (`diversity_score`): Diversity of declaration sources (0-1)

#### Tertiary Factors (Low Weight)
- **Recency Bonus** (`recency_factor`): Bonus for recent activity (0-0.2)
- **Penalty Factors** (`penalty_score`): Deductions for negative behaviors (0-1)

### 2. Weight Configuration

```javascript
const SCORING_WEIGHTS = {
  // Primary factors (total: 0.60)
  declaration_count: 0.20,
  quality_score: 0.15,
  issuer_reputation: 0.15,
  verification_rate: 0.10,
  
  // Secondary factors (total: 0.30)
  consistency_score: 0.10,
  network_score: 0.10,
  diversity_score: 0.10,
  
  // Tertiary factors (total: 0.10)
  recency_factor: 0.05,
  penalty_score: -0.05  // Negative weight for penalties
};
```

### 3. Temporal Decay Functions

#### Exponential Decay
Used for declaration relevance over time:

```
decay_factor = e^(-λt)
```

Where:
- `λ` (lambda) = decay constant (0.1 per day)
- `t` = time elapsed in days

#### Linear Decay
Used for penalty reduction:

```
penalty_decay = max(0, 1 - (t / recovery_period))
```

Where:
- `recovery_period` = 30 days (configurable)

#### Sigmoid Decay
Used for network effect propagation:

```
network_decay = 1 / (1 + e^(k(d - d0)))
```

Where:
- `k` = steepness parameter (2.0)
- `d` = network distance
- `d0` = half-decay distance (3 hops)

## Core Algorithm

### Base Score Calculation

```javascript
function calculateBaseScore(factors, weights) {
  let baseScore = 0;
  
  // Weighted sum of all factors
  for (const [factor, value] of Object.entries(factors)) {
    if (weights[factor]) {
      baseScore += value * weights[factor];
    }
  }
  
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, baseScore));
}
```

### Temporal Adjustment

```javascript
function applyTemporalDecay(score, declarations) {
  let adjustedScore = 0;
  let totalWeight = 0;
  
  declarations.forEach(declaration => {
    const age = (Date.now() - declaration.timestamp) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-0.1 * age);
    const weight = declaration.weight * decayFactor;
    
    adjustedScore += declaration.impact * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? adjustedScore / totalWeight : score;
}
```

### Confidence Interval Calculation

```javascript
function calculateConfidenceInterval(score, sampleSize, variance) {
  // Use Student's t-distribution for small samples
  const confidenceLevel = 0.95;
  const degreesOfFreedom = Math.max(1, sampleSize - 1);
  const tValue = getTValue(confidenceLevel, degreesOfFreedom);
  
  const standardError = Math.sqrt(variance / sampleSize);
  const marginOfError = tValue * standardError;
  
  return {
    lower: Math.max(0, score - marginOfError),
    upper: Math.min(1, score + marginOfError),
    confidence: confidenceLevel
  };
}
```

## Scoring Examples

### Example 1: High Trust Entity

**Input Factors:**
- Declaration Count: 150 declarations
- Quality Score: 0.92
- Issuer Reputation: 0.88
- Verification Rate: 0.95
- Consistency Score: 0.85
- Network Score: 0.78
- Diversity Score: 0.82
- Recency Factor: 0.15
- Penalty Score: 0.0

**Calculation:**
```
Base Score = (150/200 * 0.20) + (0.92 * 0.15) + (0.88 * 0.15) + 
             (0.95 * 0.10) + (0.85 * 0.10) + (0.78 * 0.10) + 
             (0.82 * 0.10) + (0.15 * 0.05) + (0.0 * -0.05)
           = 0.15 + 0.138 + 0.132 + 0.095 + 0.085 + 0.078 + 0.082 + 0.0075 + 0
           = 0.7675
```

**Temporal Adjustment:** 0.7675 * 0.95 = 0.729
**Final Score:** 0.729
**Confidence Interval:** [0.695, 0.763] (95% confidence)

### Example 2: Medium Trust Entity

**Input Factors:**
- Declaration Count: 45 declarations
- Quality Score: 0.72
- Issuer Reputation: 0.65
- Verification Rate: 0.78
- Consistency Score: 0.68
- Network Score: 0.55
- Diversity Score: 0.62
- Recency Factor: 0.08
- Penalty Score: 0.1

**Calculation:**
```
Base Score = (45/200 * 0.20) + (0.72 * 0.15) + (0.65 * 0.15) + 
             (0.78 * 0.10) + (0.68 * 0.10) + (0.55 * 0.10) + 
             (0.62 * 0.10) + (0.08 * 0.05) + (0.1 * -0.05)
           = 0.045 + 0.108 + 0.0975 + 0.078 + 0.068 + 0.055 + 0.062 + 0.004 - 0.005
           = 0.5125
```

**Temporal Adjustment:** 0.5125 * 0.92 = 0.471
**Final Score:** 0.471
**Confidence Interval:** [0.423, 0.519] (95% confidence)

## Edge Cases and Behaviors

### 1. New Entities (Cold Start)
- **Behavior:** Start with neutral score (0.5)
- **Confidence:** Very low initially, increases with data
- **Special Handling:** Accelerated learning for first 10 declarations

### 2. Inactive Entities
- **Behavior:** Gradual score decay over time
- **Decay Rate:** 5% per month of inactivity
- **Minimum Score:** Cannot decay below 0.1

### 3. Penalty Recovery
- **Behavior:** Linear recovery over 30-day period
- **Conditions:** No new negative events during recovery
- **Maximum Recovery:** 80% of original penalty impact

### 4. Sybil Attack Detection
- **Trigger:** Unusual declaration patterns from related entities
- **Response:** Temporary score freeze and investigation
- **Recovery:** Manual review and potential score adjustment

### 5. Score Volatility Limits
- **Maximum Change:** 0.1 points per day
- **Smoothing:** Moving average over 7-day window
- **Exception:** Critical security events can override limits

## Audit Trail and Explainability

### Score Change Attribution

Each score update includes detailed attribution:

```javascript
{
  "scoreChange": {
    "previous": 0.652,
    "current": 0.678,
    "delta": 0.026,
    "timestamp": "2024-01-15T10:30:00Z",
    "attribution": {
      "declaration_impact": 0.018,
      "quality_improvement": 0.012,
      "temporal_decay": -0.004
    },
    "confidence_change": {
      "previous_interval": [0.621, 0.683],
      "current_interval": [0.651, 0.705]
    },
    "evidence_trail": [
      {
        "type": "trust_declaration",
        "id": "decl_abc123",
        "impact": 0.015,
        "reason": "High-quality declaration from reputable issuer"
      }
    ]
  }
}
```

### Why Trail Components

1. **Source Evidence:** Links to original declarations and data
2. **Weight Justification:** Explanation of why specific weights were applied
3. **Temporal Context:** How timing affected the calculation
4. **Confidence Factors:** What contributed to confidence level changes
5. **Comparative Analysis:** How score compares to similar entities

## Configuration and Tuning

### Adjustable Parameters

```javascript
const ALGORITHM_CONFIG = {
  // Decay parameters
  temporal_decay_lambda: 0.1,        // per day
  network_decay_steepness: 2.0,
  penalty_recovery_days: 30,
  
  // Confidence parameters
  min_sample_size: 5,
  confidence_level: 0.95,
  
  // Volatility controls
  max_daily_change: 0.1,
  smoothing_window_days: 7,
  
  // Normalization factors
  max_declaration_count: 200,
  network_distance_limit: 5
};
```

### A/B Testing Framework

The algorithm supports A/B testing of different parameter sets:

- **Control Group:** Current production parameters
- **Test Groups:** Alternative parameter configurations
- **Metrics:** Score accuracy, stability, and user satisfaction
- **Duration:** Minimum 30-day test periods

## Performance Considerations

### Computational Complexity
- **Base Calculation:** O(n) where n = number of factors
- **Temporal Decay:** O(d) where d = number of declarations
- **Network Effects:** O(h^k) where h = average connections, k = max hops

### Optimization Strategies
- **Caching:** Pre-computed network distances and issuer reputations
- **Incremental Updates:** Only recalculate affected components
- **Batch Processing:** Group similar calculations for efficiency

### Scalability Limits
- **Single Entity:** Up to 10,000 declarations efficiently
- **Network Analysis:** Up to 1 million entities with 5-hop analysis
- **Real-time Updates:** Sub-100ms response time for score queries

## Monitoring and Alerting

### Key Metrics
- **Score Distribution:** Histogram of all entity scores
- **Confidence Levels:** Average confidence across all scores
- **Update Frequency:** Rate of score changes per entity
- **Algorithm Performance:** Calculation time and resource usage

### Alert Conditions
- **Unusual Score Volatility:** Scores changing > 0.2 in 24 hours
- **Low Confidence Epidemic:** > 20% of entities with confidence < 0.7
- **Performance Degradation:** Calculation time > 500ms
- **Data Quality Issues:** Missing or invalid input factors

## Future Enhancements

### Planned Improvements
1. **Machine Learning Integration:** Neural network for pattern recognition
2. **Dynamic Weight Adjustment:** Adaptive weights based on entity type
3. **Multi-dimensional Scoring:** Separate scores for different trust aspects
4. **Federated Scoring:** Cross-protocol score sharing and validation

### Research Areas
- **Quantum-resistant Cryptographic Scoring:** Future-proof security
- **Behavioral Pattern Analysis:** Advanced anomaly detection
- **Consensus Mechanisms:** Decentralized score validation
- **Privacy-preserving Computation:** Zero-knowledge score proofs

---

*This document is version 1.0 and will be updated as the algorithm evolves. For technical questions or suggestions, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines.*