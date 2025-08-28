import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import '../styles/builder.css';

const Reports = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/reports?page=${currentPage}&limit=6`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      const response = await axios.get(url);
      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate daily report
  const generateDailyReport = async () => {
    try {
      await axios.post('/api/reports/generate/daily');
      fetchReports();
    } catch (err) {
      console.error('Error generating daily report:', err);
      setError('Failed to generate daily report. Please try again.');
    }
  };
  
  // Handle report actions
  const handleReportAction = (event, report) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleViewDetails = () => {
    setMenuAnchorEl(null);
    setDetailDialogOpen(true);
  };
  
  const handleArchiveReport = () => {
    setMenuAnchorEl(null);
    setArchiveDialogOpen(true);
  };
  
  const handleDeleteReport = () => {
    setMenuAnchorEl(null);
    setDeleteDialogOpen(true);
  };
  
  const confirmArchive = async () => {
    try {
      await axios.put(`/api/reports/${selectedReport._id}`, {
        isArchived: !selectedReport.isArchived
      });
      setArchiveDialogOpen(false);
      fetchReports();
    } catch (err) {
      console.error('Error archiving report:', err);
      setError('Failed to archive report. Please try again.');
    }
  };
  
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/reports/${selectedReport._id}`);
      setDeleteDialogOpen(false);
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report. Please try again.');
    }
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setCurrentPage(1);
  };
  
  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Effect to fetch reports on mount and when dependencies change
  useEffect(() => {
    fetchReports();
  }, [currentPage, selectedCategory]);
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'daily':
        return <CheckCircleIcon color="success" />;
      case 'weekly':
        return <InfoIcon color="info" />;
      case 'audit':
        return <AssessmentIcon color="primary" />;
      case 'alert':
        return <WarningIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Symbi Logs
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={generateDailyReport}
            sx={{ mr: 1 }}
          >
            Generate Daily Report
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Box>
        
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Reports" value="all" />
          <Tab label="Daily" value="daily" />
          <Tab label="Weekly" value="weekly" />
          <Tab label="Audit" value="audit" />
          <Tab label="Alerts" value="alert" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchReports}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No reports found.</Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {reports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report._id}>
                <Card 
                  className={`report-card ${report.category}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <CardHeader
                    avatar={getCategoryIcon(report.category)}
                    action={
                      <IconButton onClick={(e) => handleReportAction(e, report)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={report.title}
                    subheader={formatDate(report.createdAt)}
                  />
                  <Divider />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {report.content.length > 150
                        ? `${report.content.substring(0, 150)}...`
                        : report.content}
                    </Typography>
                    
                    {report.stats && report.stats.size > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Stats:
                        </Typography>
                        <Grid container spacing={1}>
                          {Array.from(report.stats.entries()).map(([key, value]) => (
                            <Grid item key={key}>
                              <Chip
                                label={`${key}: ${value}`}
                                size="small"
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                  
                  {report.isArchived && (
                    <Chip
                      label="Archived"
                      size="small"
                      color="default"
                      sx={{ position: 'absolute', top: 12, right: 48 }}
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
      
      {/* Report Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleArchiveReport}>
          {selectedReport?.isArchived ? (
            <>
              <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Unarchive
            </>
          ) : (
            <>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Archive
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteReport}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Report Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getCategoryIcon(selectedReport.category)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedReport.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {formatDate(selectedReport.createdAt)}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {selectedReport.content}
              </Typography>
              
              {selectedReport.stats && selectedReport.stats.size > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    {Array.from(selectedReport.stats.entries()).map(([key, value]) => (
                      <Grid item xs={6} sm={3} key={key}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="h4" color="primary">
                            {value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {key.replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {selectedReport.metadata && Object.keys(selectedReport.metadata).length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Metadata
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <pre>
                      {JSON.stringify(selectedReport.metadata, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
      >
        <DialogTitle>
          {selectedReport?.isArchived ? 'Unarchive Report' : 'Archive Report'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedReport?.isArchived
              ? 'Are you sure you want to unarchive this report?'
              : 'Are you sure you want to archive this report? Archived reports will be hidden from the main view.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmArchive} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reports;