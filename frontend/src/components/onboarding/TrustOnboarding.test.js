import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrustOnboarding from './TrustOnboarding';

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

describe('TrustOnboarding Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders first step correctly', () => {
    render(<TrustOnboarding open={true} onClose={() => {}} />);
    
    expect(screen.getByText('Welcome to Symbi Trust')).toBeInTheDocument();
    expect(screen.getByText('Symbi helps you understand the trustworthiness of AI responses at a glance.')).toBeInTheDocument();
    
    // Check iframe is present with correct src
    const iframe = screen.getByTitle('Welcome to Symbi Trust');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain('/images/onboarding/trust-intro.html');
  });

  test('navigates to next step when Next button is clicked', () => {
    render(<TrustOnboarding open={true} onClose={() => {}} />);
    
    // Click Next button
    fireEvent.click(screen.getByText('Next'));
    
    // Should show second step
    expect(screen.getByText('Trust Badges')).toBeInTheDocument();
    expect(screen.getByText('Look for these badges next to AI messages. They show you how reliable the information is.')).toBeInTheDocument();
    
    // Check iframe is updated
    const iframe = screen.getByTitle('Trust Badges');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain('/images/onboarding/trust-badges.html');
  });

  test('navigates to previous step when Back button is clicked', () => {
    render(<TrustOnboarding open={true} onClose={() => {}} />);
    
    // Go to second step
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Trust Badges')).toBeInTheDocument();
    
    // Go back to first step
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Welcome to Symbi Trust')).toBeInTheDocument();
  });

  test('completes onboarding when Finish button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<TrustOnboarding open={true} onClose={onCloseMock} />);
    
    // Go to last step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Simple by Default')).toBeInTheDocument();
    
    // Click Finish
    fireEvent.click(screen.getByText('Finish'));
    
    // Should set localStorage and call onClose
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trustOnboardingComplete', 'true');
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('Back button is disabled on first step', () => {
    render(<TrustOnboarding open={true} onClose={() => {}} />);
    
    const backButton = screen.getByText('Back');
    expect(backButton).toBeDisabled();
  });

  test('shows Finish button on last step instead of Next', () => {
    render(<TrustOnboarding open={true} onClose={() => {}} />);
    
    // Go to last step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    
    // Should show Finish button
    expect(screen.getByText('Finish')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });
});
