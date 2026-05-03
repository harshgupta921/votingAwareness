import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

const TestComponent = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return <div>{user ? `User: ${user.email}` : 'No User'}</div>;
};

describe('AuthContext', () => {
  it('shows unauthenticated state if no user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('No User')).toBeInTheDocument());
  });
});
