import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('Navbar', () => {
  it('renders the application title', () => {
    render(
      <AuthProvider>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </AuthProvider>
    );
    
    expect(screen.getByText('VoteIndia')).toBeInTheDocument();
  });
});
