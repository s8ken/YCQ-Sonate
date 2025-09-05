import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageWithCI from './MessageWithCI';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the TrustBadge component
jest.mock('../trust/TrustBadge', () => {
  return function MockTrustBadge({ trustScore, simplified }) {
    return (
      <div data-testid="trust-badge" data-score={trustScore} data-simplified={simplified}>
        Trust Badge
      </div>
    );
  };
});

// Mock the ContextTags component
jest.mock('./ContextTags', () => {
  return function MockContextTags({ tags }) {
    return <div data-testid="context-tags">{tags.join(', ')}</div>;
  };
});

const theme = createTheme();

describe('MessageWithCI Component', () => {
  const mockMessage = {
    content: 'Test message content',
    sender: 'ai',
    trustScore: 0.85,
    ciModel: 'Symbi Core',
    contextTags: ['test', 'message'],
    timestamp: new Date().toISOString()
  };

  test('renders message content correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageWithCI message={mockMessage} isUser={false} timestamp={mockMessage.timestamp} />
      </ThemeProvider>
    );
    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  test('renders TrustBadge with correct props when not expanded', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageWithCI message={mockMessage} isUser={false} timestamp={mockMessage.timestamp} />
      </ThemeProvider>
    );
    
    const trustBadge = screen.getByTestId('trust-badge');
    expect(trustBadge).toBeInTheDocument();
    expect(trustBadge.dataset.score).toBe('0.85');
    expect(trustBadge.dataset.simplified).toBe('true'); // Should be simplified when not expanded
  });

  test('expands metadata section when clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageWithCI message={mockMessage} isUser={false} timestamp={mockMessage.timestamp} />
      </ThemeProvider>
    );
    
    // Find and click the expand button
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // Check that metadata is now visible
    expect(screen.getByText('Cognitive Intelligence Metadata')).toBeInTheDocument();
    expect(screen.getByText('CI Model')).toBeInTheDocument();
    expect(screen.getByText('Symbi Core')).toBeInTheDocument();
  });

  test('renders TrustBadge with correct props in expanded metadata', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageWithCI message={mockMessage} isUser={false} timestamp={mockMessage.timestamp} />
      </ThemeProvider>
    );
    
    // Expand the metadata section
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // There should now be two TrustBadge components - one in header and one in metadata
    const trustBadges = screen.getAllByTestId('trust-badge');
    expect(trustBadges.length).toBe(2);
    
    // The one in metadata should not be simplified
    expect(trustBadges[1].dataset.simplified).toBe('undefined');
  });

  test('handles user messages correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageWithCI message={mockMessage} isUser={true} timestamp={mockMessage.timestamp} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
