import { render, screen, fireEvent } from '@testing-library/react';
import PremiumButton from '@/components/ui/PremiumButton';
import React from 'react';

describe('PremiumButton', () => {
  it('renders children correctly', () => {
    render(<PremiumButton>Click Me</PremiumButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click Me</PremiumButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    const { container } = render(<PremiumButton variant="secondary">Secondary</PremiumButton>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-white');
  });

  it('adds ripples on click', () => {
    const { container } = render(<PremiumButton>Ripple Test</PremiumButton>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Framer motion span with absolute positioning
    const ripples = container.querySelectorAll('.absolute.bg-white\\/30');
    expect(ripples.length).toBeGreaterThan(0);
  });
});
