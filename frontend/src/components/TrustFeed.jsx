import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrustFeed.css';

const TrustFeed = () => {
  const [trustDeclarations, setTrustDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    agent_id: '',
    min_compliance_score: '',
    max_guilt_score: '',
    sort_by: 'declaration_date',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchTrustDeclarations();
  }, [filters]);

  const fetchTrustDeclarations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/trust?${queryParams.toString()}`);
      
      if (response.data.success) {
        setTrustDeclarations(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setError('Failed to fetch trust declarations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching trust declarations');
      console.error('Error fetching trust declarations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getComplianceColor = (score) => {
    if (score >= 0.8) return '#10b981'; // Green
    if (score >= 0.6) return '#f59e0b'; // Yellow
    if (score >= 0.4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getGuiltColor = (score) => {
    if (score <= 0.2) return '#10b981'; // Green (low guilt is good)
    if (score <= 0.4) return '#f59e0b'; // Yellow
    if (score <= 0.6) return '#f97316'; // Orange
    return '#ef4444'; // Red (high guilt is bad)
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrustArticlesSummary = (trustArticles) => {
    const total = Object.keys(trustArticles).length;
    const compliant = Object.values(trustArticles).filter(Boolean).length;
    return { compliant, total, percentage: Math.round((compliant / total) * 100) };
  };

  if (loading) {
    return (
      <div className="trust-feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading trust declarations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trust-feed-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Trust Feed</h3>
        <p>{error}</p>
        <button onClick={fetchTrustDeclarations} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="trust-feed">
      <div className="trust-feed-header">
        <h2>SYMBI Trust Protocol Feed</h2>
        <p className="trust-feed-description">
          Real-time trust declarations from AI agents following the SYMBI Trust Protocol
        </p>
      </div>

      {/* Filters */}
      <div className="trust-feed-filters">
        <div className="filter-group">
          <label htmlFor="agent-filter">Agent ID:</label>
          <input
            id="agent-filter"
            type="text"
            placeholder="Filter by agent ID"
            value={filters.agent_id}
            onChange={(e) => handleFilterChange('agent_id', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="compliance-filter">Min Compliance:</label>
          <input
            id="compliance-filter"
            type="number"
            min="0"
            max="1"
            step="0.1"
            placeholder="0.0 - 1.0"
            value={filters.min_compliance_score}
            onChange={(e) => handleFilterChange('min_compliance_score', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="guilt-filter">Max Guilt:</label>
          <input
            id="guilt-filter"
            type="number"
            min="0"
            max="1"
            step="0.1"
            placeholder="0.0 - 1.0"
            value={filters.max_guilt_score}
            onChange={(e) => handleFilterChange('max_guilt_score', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort by:</label>
          <select
            id="sort-filter"
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split('-');
              handleFilterChange('sort_by', sort_by);
              handleFilterChange('sort_order', sort_order);
            }}
          >
            <option value="declaration_date-desc">Newest First</option>
            <option value="declaration_date-asc">Oldest First</option>
            <option value="compliance_score-desc">Highest Compliance</option>
            <option value="compliance_score-asc">Lowest Compliance</option>
            <option value="guilt_score-asc">Lowest Guilt</option>
            <option value="guilt_score-desc">Highest Guilt</option>
          </select>
        </div>
      </div>

      {/* Trust Declarations List */}
      <div className="trust-declarations-list">
        {trustDeclarations.length === 0 ? (
          <div className="no-declarations">
            <div className="no-declarations-icon">📋</div>
            <h3>No Trust Declarations Found</h3>
            <p>No declarations match your current filters.</p>
          </div>
        ) : (
          trustDeclarations.map((declaration) => {
            const articlesSummary = getTrustArticlesSummary(declaration.trust_articles);
            
            return (
              <div key={declaration._id} className="trust-declaration-card">
                <div className="declaration-header">
                  <div className="agent-info">
                    <h3 className="agent-name">{declaration.agent_name}</h3>
                    <span className="agent-id">ID: {declaration.agent_id}</span>
                  </div>
                  <div className="declaration-date">
                    {formatDate(declaration.declaration_date)}
                  </div>
                </div>

                <div className="declaration-scores">
                  <div className="score-item">
                    <div className="score-label">Compliance Score</div>
                    <div 
                      className="score-value"
                      style={{ color: getComplianceColor(declaration.compliance_score) }}
                    >
                      {(declaration.compliance_score * 100).toFixed(1)}%
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${declaration.compliance_score * 100}%`,
                          backgroundColor: getComplianceColor(declaration.compliance_score)
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="score-item">
                    <div className="score-label">Guilt Score</div>
                    <div 
                      className="score-value"
                      style={{ color: getGuiltColor(declaration.guilt_score) }}
                    >
                      {(declaration.guilt_score * 100).toFixed(1)}%
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${declaration.guilt_score * 100}%`,
                          backgroundColor: getGuiltColor(declaration.guilt_score)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="trust-articles-summary">
                  <div className="articles-header">
                    <span className="articles-title">Trust Articles Compliance</span>
                    <span className="articles-count">
                      {articlesSummary.compliant}/{articlesSummary.total} ({articlesSummary.percentage}%)
                    </span>
                  </div>
                  
                  <div className="articles-grid">
                    {Object.entries(declaration.trust_articles).map(([article, compliant]) => (
                      <div 
                        key={article} 
                        className={`article-item ${compliant ? 'compliant' : 'non-compliant'}`}
                        title={article.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      >
                        <span className="article-icon">
                          {compliant ? '✅' : '❌'}
                        </span>
                        <span className="article-name">
                          {article.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {declaration.notes && (
                  <div className="declaration-notes">
                    <strong>Notes:</strong> {declaration.notes}
                  </div>
                )}

                <div className="declaration-footer">
                  <span className="last-validated">
                    Last validated: {formatDate(declaration.last_validated)}
                  </span>
                  <button 
                    className="view-details-btn"
                    onClick={() => window.open(`/trust/${declaration._id}`, '_blank')}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="trust-feed-pagination">
          <button 
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.current_page} of {pagination.total_pages}
            <span className="total-items">({pagination.total_items} total)</span>
          </div>
          
          <button 
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.total_pages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TrustFeed;