import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '@/contexts/AccessibilityContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const TestComponent = () => {
  const { state, increaseFontSize, toggleHighContrast } = useAccessibility();
  return (
    <div>
      <span data-testid="font-size">{state.fontSize}</span>
      <span data-testid="contrast">{state.highContrast.toString()}</span>
      <button onClick={increaseFontSize}>Increase Font</button>
      <button onClick={toggleHighContrast}>Toggle Contrast</button>
    </div>
  );
};

describe('AccessibilityContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('provides default values', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    expect(screen.getByTestId('font-size').textContent).toBe('100');
    expect(screen.getByTestId('contrast').textContent).toBe('false');
  });

  it('updates font size', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    fireEvent.click(screen.getByText('Increase Font'));
    expect(screen.getByTestId('font-size').textContent).toBe('110');
  });

  it('toggles high contrast', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    fireEvent.click(screen.getByText('Toggle Contrast'));
    expect(screen.getByTestId('contrast').textContent).toBe('true');
  });
});
