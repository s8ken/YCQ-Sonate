import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import '../../styles/builder.css';

const ReportCard = ({ report, onClick, onArchive, onDelete }) => {
  const theme = useTheme();
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'audit':
        return <AssessmentIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'error':
        return <BugReportIcon fontSize="small" color="error" />;
      default:
        return <InfoIcon fontSize="small" color="info" />;
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'audit':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Card 
      className="report-card"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        opacity: report.archived ? 0.7 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: getCategoryColor(report.category)
        }
      }}
    >
      <CardActionArea onClick={() => onClick(report)} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getCategoryIcon(report.category)}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ ml: 0.5, textTransform: 'uppercase' }}
              >
                {report.category}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(report.createdAt)}
            </Typography>
          </Box>
          
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {report.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {report.content}
          </Typography>
          
          {report.metadata && report.metadata.tags && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {report.metadata.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title={report.archived ? 'Unarchive' : 'Archive'}>
          <IconButton 
            size="small" 
            onClick={() => onArchive(report)}
            aria-label={report.archived ? 'unarchive report' : 'archive report'}
          >
            {report.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton 
            size="small" 
            onClick={() => onDelete(report)}
            aria-label="delete report"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
      
      {report.archived && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bgcolor: 'rgba(0,0,0,0.1)', 
            px: 1, 
            borderBottomLeftRadius: 4 
          }}
        >
          <Typography variant="caption">Archived</Typography>
        </Box>
      )}
    </Card>
  );
};

export default ReportCard;