import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConversationDetail from './ConversationDetail';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  };
  return jest.fn(() => mockSocket);
});

// Mock components
jest.mock('../components/trust/TrustBadge', () => {
  return function MockTrustBadge({ trustScore }) {
    return <div data-testid="trust-badge" data-score={trustScore}>Trust Badge</div>;
  };
});

jest.mock('../components/trust/TrustChips', () => {
  return function MockTrustChips({ sessionId, at, compact }) {
    return (
      <div data-testid="trust-chips" data-session={sessionId} data-at={at} data-compact={compact}>
        Trust Chips
      </div>
    );
  };
});

jest.mock('../components/context/CapsulePanel', () => {
  return function MockCapsulePanel({ sessionId }) {
    return <div data-testid="capsule-panel" data-session={sessionId}>Capsule Panel</div>;
  };
});

jest.mock('../components/conversation/MessageWithCI', () => {
  return function MockMessageWithCI({ message, isUser, timestamp }) {
    return (
      <div data-testid="message-with-ci" data-user={isUser} data-time={timestamp}>
        {message.content}
      </div>
    );
  };
});

jest.mock('../components/onboarding/TrustOnboarding', () => {
  return function MockTrustOnboarding({ open, onClose }) {
    return (
      <div data-testid="trust-onboarding" data-open={open}>
        Trust Onboarding
        {open && <button onClick={onClose}>Close Onboarding</button>}
      </div>
    );
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ConversationDetail Component', () => {
  const mockConversation = {
    _id: '123',
    title: 'Test Conversation',
    messages: [
      {
        _id: 'm1',
        content: 'Hello AI',
        sender: 'user',
        timestamp: '2023-01-01T12:00:00Z'
      },
      {
        _id: 'm2',
        content: 'Hello human',
        sender: 'ai',
        trustScore: 0.9,
        ciModel: 'Symbi Core',
        timestamp: '2023-01-01T12:01:00Z'
      }
    ],
    ethicalScore: 4.5
  };

  const mockAgents = [
    { _id: 'agent1', name: 'Test Agent' }
  ];

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/conversations/123')) {
        return Promise.resolve({ data: { data: mockConversation } });
      }
      if (url.includes('/agents')) {
        return Promise.resolve({ data: { data: mockAgents } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    // Mock localStorage token
    localStorageMock.setItem('token', 'test-token');
  });

  test('renders conversation details correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/conversations/123']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    
    // Check messages are rendered
    expect(screen.getByText('Hello AI')).toBeInTheDocument();
    expect(screen.getByText('Hello human')).toBeInTheDocument();
  });

  test('toggles between simple and detailed trust view', async () => {
    render(
      <MemoryRouter initialEntries={['/conversations/123']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    
    // Initially should show TrustBadge (simple view)
    expect(screen.getByTestId('trust-badge')).toBeInTheDocument();
    
    // Toggle to detailed view
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    // Should now show TrustChips (detailed view)
    expect(screen.getByTestId('trust-chips')).toBeInTheDocument();
    
    // Toggle back to simple view
    fireEvent.click(toggle);
    
    // Should show TrustBadge again
    expect(screen.getByTestId('trust-badge')).toBeInTheDocument();
  });

  test('saves trust detail level preference to localStorage', async () => {
    render(
      <MemoryRouter initialEntries={['/conversations/123']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    
    // Toggle to detailed view
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    // Should save preference to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trustDetailLevel', 'detailed');
    
    // Toggle back to simple view
    fireEvent.click(toggle);
    
    // Should update preference in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trustDetailLevel', 'simple');
  });

  test('shows onboarding for first-time users', async () => {
    // Ensure trustOnboardingComplete is not set
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'trustOnboardingComplete') return null;
      if (key === 'token') return 'test-token';
      return null;
    });
    
    render(
      <MemoryRouter initialEntries={['/conversations/123']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    
    // Onboarding should be shown
    const onboarding = screen.getByTestId('trust-onboarding');
    expect(onboarding).toBeInTheDocument();
    expect(onboarding.dataset.open).toBe('true');
    
    // Close onboarding
    fireEvent.click(screen.getByText('Close Onboarding'));
    
    // Onboarding should be closed
    expect(onboarding.dataset.open).toBe('false');
  });

  test('does not show onboarding for returning users', async () => {
    // Set trustOnboardingComplete to true
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'trustOnboardingComplete') return 'true';
      if (key === 'token') return 'test-token';
      return null;
    });
    
    render(
      <MemoryRouter initialEntries={['/conversations/123']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    
    // Onboarding should be present but not open
    const onboarding = screen.getByTestId('trust-onboarding');
    expect(onboarding).toBeInTheDocument();
    expect(onboarding.dataset.open).toBe('false');
  });
});
