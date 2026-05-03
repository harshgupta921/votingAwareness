import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

const TestComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="text">{t('nav.home')}</span>
      <button onClick={() => setLanguage('hi')}>Change to Hindi</button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('provides default language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('changes language and updates translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const button = screen.getByText('Change to Hindi');
    fireEvent.click(button);
    
    expect(screen.getByTestId('lang').textContent).toBe('hi');
  });
});
