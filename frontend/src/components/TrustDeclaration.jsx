import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TrustDeclaration.css';

const TrustDeclaration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [declaration, setDeclaration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditMode, setAuditMode] = useState(false);
  const [auditData, setAuditData] = useState({
    compliance_score: '',
    guilt_score: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchTrustDeclaration();
    }
  }, [id]);

  const fetchTrustDeclaration = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/trust/${id}`);
      
      if (response.data.success) {
        setDeclaration(response.data.data);
        setAuditData({
          compliance_score: response.data.data.compliance_score,
          guilt_score: response.data.data.guilt_score,
          notes: response.data.data.notes || ''
        });
        setError(null);
      } else {
        setError('Trust declaration not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching trust declaration');
      console.error('Error fetching trust declaration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async () => {
    try {
      const response = await axios.post(`/api/trust/${id}/audit`, auditData);
      
      if (response.data.success) {
        setDeclaration(response.data.data);
        setAuditMode(false);
        setToast({ open: true, severity: 'success', message: 'Trust declaration audited successfully' });
      } else {
        setToast({ open: true, severity: 'error', message: 'Failed to audit trust declaration' });
      }
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.response?.data?.message || 'Error auditing trust declaration' });
      console.error('Error auditing trust declaration:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getComplianceColor = (score) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    if (score >= 0.4) return '#f97316';
    return '#ef4444';
  };

  const getGuiltColor = (score) => {
    if (score <= 0.2) return '#10b981';
    if (score <= 0.4) return '#f59e0b';
    if (score <= 0.6) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score, type) => {
    if (type === 'compliance') {
      if (score >= 0.8) return 'Excellent';
      if (score >= 0.6) return 'Good';
      if (score >= 0.4) return 'Fair';
      return 'Poor';
    } else {
      if (score <= 0.2) return 'Minimal';
      if (score <= 0.4) return 'Low';
      if (score <= 0.6) return 'Moderate';
      return 'High';
    }
  };

  const renderTrustArticles = () => {
    if (!declaration?.trust_articles) return null;

    const articles = Object.entries(declaration.trust_articles);
    const compliantCount = articles.filter(([, compliant]) => compliant).length;
    const totalCount = articles.length;
    const compliancePercentage = Math.round((compliantCount / totalCount) * 100);

    return (
      <div className="trust-articles-section">
        <div className="section-header">
          <h3>Trust Articles Compliance</h3>
          <div className="compliance-summary">
            <span className="compliance-count">{compliantCount}/{totalCount}</span>
            <span className="compliance-percentage">({compliancePercentage}%)</span>
          </div>
        </div>
        
        <div className="articles-detailed-grid">
          {articles.map(([article, compliant]) => {
            const articleName = article.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={article} className={`article-detailed-item ${compliant ? 'compliant' : 'non-compliant'}`}>
                <div className="article-status">
                  <span className="article-icon">
                    {compliant ? '✅' : '❌'}
                  </span>
                  <span className={`status-text ${compliant ? 'compliant' : 'non-compliant'}`}>
                    {compliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <div className="article-name">{articleName}</div>
                <div className="article-description">
                  {getArticleDescription(article)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getArticleDescription = (article) => {
    const descriptions = {
      transparency: 'Agent provides clear information about its capabilities and limitations',
      accountability: 'Agent takes responsibility for its actions and decisions',
      fairness: 'Agent treats all users and situations equitably without bias',
      privacy: 'Agent respects and protects user privacy and data',
      safety: 'Agent prioritizes safety in all interactions and recommendations',
      reliability: 'Agent provides consistent and dependable service',
      honesty: 'Agent provides truthful and accurate information',
      respect: 'Agent treats users with dignity and respect',
      beneficence: 'Agent acts in the best interest of users and society',
      non_maleficence: 'Agent avoids causing harm through its actions'
    };
    
    return descriptions[article] || 'Trust protocol compliance requirement';
  };

  const renderAuditHistory = () => {
    if (!declaration?.audit_history || declaration.audit_history.length === 0) {
      return (
        <div className="no-audit-history">
          <p>No audit history available for this declaration.</p>
        </div>
      );
    }

    return (
      <div className="audit-history-list">
        {declaration.audit_history.map((audit, index) => (
          <div key={index} className="audit-entry">
            <div className="audit-header">
              <span className="audit-date">{formatDate(audit.audit_date)}</span>
              <span className="auditor">Auditor: {audit.auditor || 'System'}</span>
            </div>
            <div className="audit-scores">
              <span className="audit-score">
                Compliance: <strong>{(audit.compliance_score * 100).toFixed(1)}%</strong>
              </span>
              <span className="audit-score">
                Guilt: <strong>{(audit.guilt_score * 100).toFixed(1)}%</strong>
              </span>
            </div>
            {audit.notes && (
              <div className="audit-notes">
                <strong>Notes:</strong> {audit.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="trust-declaration-loading">
        <div className="loading-spinner"></div>
        <p>Loading trust declaration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trust-declaration-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Trust Declaration</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={fetchTrustDeclaration} className="retry-button">
            Try Again
          </button>
          <button onClick={() => navigate('/trust')} className="back-button">
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="trust-declaration-not-found">
        <h3>Trust Declaration Not Found</h3>
        <p>The requested trust declaration could not be found.</p>
        <button onClick={() => navigate('/trust')} className="back-button">
          Back to Feed
        </button>
      </div>
    );
  }

  const [toast, setToast] = useState({ open: false, severity: 'info', message: '' });

  return (
    <div className="trust-declaration-detail">
      {/* Header */}
      <div className="declaration-detail-header">
        <button onClick={() => navigate('/trust')} className="back-nav-button">
          ← Back to Trust Feed
        </button>
        <div className="header-actions">
          <button 
            onClick={() => setAuditMode(!auditMode)} 
            className={`audit-toggle-btn ${auditMode ? 'active' : ''}`}
          >
            {auditMode ? 'Cancel Audit' : 'Audit Declaration'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="declaration-content">
        {/* Agent Information */}
        <div className="agent-info-section">
          <h2>Agent Information</h2>
          <div className="agent-details">
            <div className="agent-detail-item">
              <label>Agent Name:</label>
              <span className="agent-name">{declaration.agent_name}</span>
            </div>
            <div className="agent-detail-item">
              <label>Agent ID:</label>
              <span className="agent-id">{declaration.agent_id}</span>
            </div>
            <div className="agent-detail-item">
              <label>Declaration Date:</label>
              <span className="declaration-date">{formatDate(declaration.declaration_date)}</span>
            </div>
            <div className="agent-detail-item">
              <label>Last Validated:</label>
              <span className="last-validated">{formatDate(declaration.last_validated)}</span>
            </div>
          </div>
        </div>

        {/* Scores Section */}
        <div className="scores-section">
          <h2>Trust Scores</h2>
          <div className="detailed-scores">
            <div className="score-card compliance">
              <div className="score-header">
                <h3>Compliance Score</h3>
                <span className="score-label">{getScoreLabel(declaration.compliance_score, 'compliance')}</span>
              </div>
              <div className="score-display">
                <div 
                  className="score-circle"
                  style={{ '--score': declaration.compliance_score, '--color': getComplianceColor(declaration.compliance_score) }}
                >
                  <span className="score-text">{(declaration.compliance_score * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="score-description">
                Measures adherence to trust protocol articles and ethical guidelines.
              </div>
            </div>

            <div className="score-card guilt">
              <div className="score-header">
                <h3>Guilt Score</h3>
                <span className="score-label">{getScoreLabel(declaration.guilt_score, 'guilt')}</span>
              </div>
              <div className="score-display">
                <div 
                  className="score-circle"
                  style={{ '--score': declaration.guilt_score, '--color': getGuiltColor(declaration.guilt_score) }}
                >
                  <span className="score-text">{(declaration.guilt_score * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="score-description">
                Indicates potential violations or concerning behaviors detected.
              </div>
            </div>
          </div>
        </div>

        {/* Trust Articles */}
        {renderTrustArticles()}

        {/* Notes Section */}
        {declaration.notes && (
          <div className="notes-section">
            <h3>Declaration Notes</h3>
            <div className="notes-content">
              {declaration.notes}
            </div>
          </div>
        )}

        {/* Audit Section */}
        {auditMode && (
          <div className="audit-section">
            <h3>Audit Declaration</h3>
            <div className="audit-form">
              <div className="audit-input-group">
                <label htmlFor="audit-compliance">Compliance Score (0.0 - 1.0):</label>
                <input
                  id="audit-compliance"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={auditData.compliance_score}
                  onChange={(e) => setAuditData(prev => ({ ...prev, compliance_score: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="audit-input-group">
                <label htmlFor="audit-guilt">Guilt Score (0.0 - 1.0):</label>
                <input
                  id="audit-guilt"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={auditData.guilt_score}
                  onChange={(e) => setAuditData(prev => ({ ...prev, guilt_score: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="audit-input-group">
                <label htmlFor="audit-notes">Audit Notes:</label>
                <textarea
                  id="audit-notes"
                  rows="4"
                  value={auditData.notes}
                  onChange={(e) => setAuditData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter audit notes and justification for score adjustments..."
                />
              </div>
              <div className="audit-actions">
                <button onClick={handleAudit} className="submit-audit-btn">
                  Submit Audit
                </button>
                <button onClick={() => setAuditMode(false)} className="cancel-audit-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audit History */}
        <div className="audit-history-section">
          <h3>Audit History</h3>
          {renderAuditHistory()}
        </div>
      </div>
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default TrustDeclaration;
