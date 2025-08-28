import React from 'react';
import { Box, Chip, Tooltip, Typography, useTheme } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import '../../styles/builder.css';

const ContextTags = ({ tags, onTagClick, maxDisplay = 3, showAddButton = false, onAddTag }) => {
  const theme = useTheme();
  
  if (!tags || tags.length === 0) {
    return showAddButton ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          icon={<TagIcon />}
          label="Add Tag"
          variant="outlined"
          size="small"
          onClick={onAddTag}
          sx={{ borderStyle: 'dashed' }}
        />
      </Box>
    ) : null;
  }
  
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
      {displayTags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          size="small"
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          className="context-tag"
          sx={{
            borderRadius: '4px',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }
          }}
        />
      ))}
      
      {remainingCount > 0 && (
        <Tooltip 
          title={
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                Additional Tags:
              </Typography>
              {tags.slice(maxDisplay).map((tag, index) => (
                <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                  • {tag}
                </Typography>
              ))}
            </Box>
          }
          arrow
        >
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Tooltip>
      )}
      
      {showAddButton && (
        <Chip
          icon={<TagIcon />}
          label="Add"
          variant="outlined"
          size="small"
          onClick={onAddTag}
          sx={{ borderStyle: 'dashed', ml: 0.5 }}
        />
      )}
    </Box>
  );
};

export default ContextTags;