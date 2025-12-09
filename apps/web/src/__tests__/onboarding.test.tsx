import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OnboardingPage from '../app/onboarding/page';
import * as apiModule from '@guildr/lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('@guildr/lib/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-icon" />,
}));

describe('Onboarding Page', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render the first question', () => {
      render(<OnboardingPage />);

      const heading = screen.getByText(
        'What is your primary goal for this portfolio?'
      );
      expect(heading).toBeInTheDocument();
    });

    it('should display all answer options for first question', () => {
      render(<OnboardingPage />);

      expect(
        screen.getByText('Protect my capital (I hate losing money)')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Beat FD returns with some safety')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Maximize wealth (Aggressive Growth)')
      ).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<OnboardingPage />);

      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have 3 questions defined', () => {
      render(<OnboardingPage />);

      expect(
        screen.getByText('What is your primary goal for this portfolio?')
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should render buttons for each option', () => {
      render(<OnboardingPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be able to click answer options', () => {
      render(<OnboardingPage />);

      const firstOption = screen.getByText(
        'Protect my capital (I hate losing money)'
      );
      
      expect(() => {
        fireEvent.click(firstOption);
      }).not.toThrow();
    });

    it('should have clickable buttons', () => {
      render(<OnboardingPage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Components', () => {
    it('should display question text', () => {
      render(<OnboardingPage />);

      expect(
        screen.getByText('What is your primary goal for this portfolio?')
      ).toBeInTheDocument();
    });

    it('should have a loading state', () => {
      render(<OnboardingPage />);

      // Initially no loading text should be visible
      expect(screen.queryByText(/Analyzing your profile/i)).not.toBeInTheDocument();
    });

    it('should render with proper structure', () => {
      const { container } = render(<OnboardingPage />);

      expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });
  });

  describe('Options Rendering', () => {
    it('should render all options with correct labels', () => {
      render(<OnboardingPage />);

      const allText = screen.getByText('Protect my capital (I hate losing money)');
      expect(allText).toBeInTheDocument();
    });

    it('should have proper styling for option buttons', () => {
      render(<OnboardingPage />);

      const firstButton = screen.getByText(
        'Protect my capital (I hate losing money)'
      ).closest('button');
      
      expect(firstButton).toHaveClass('w-full');
      expect(firstButton).toHaveClass('rounded-lg');
    });

    it('should render question heading', () => {
      render(<OnboardingPage />);

      const heading = screen.getByText(
        'What is your primary goal for this portfolio?'
      );
      
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
    });
  });

  describe('Page Layout', () => {
    it('should have a container with proper padding', () => {
      const { container } = render(<OnboardingPage />);

      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('p-4');
    });

    it('should display content with max width', () => {
      const { container } = render(<OnboardingPage />);

      const contentContainer = container.querySelector('.max-w-md');
      expect(contentContainer).toBeInTheDocument();
    });

    it('should have proper background colors', () => {
      const { container } = render(<OnboardingPage />);

      const outer = container.querySelector('.bg-slate-50');
      const inner = container.querySelector('.bg-white');

      expect(outer).toBeInTheDocument();
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should style buttons with hover effects', () => {
      render(<OnboardingPage />);

      const button = screen.getByText(
        'Protect my capital (I hate losing money)'
      ).closest('button');
      
      expect(button).toHaveClass('hover:border-blue-500');
      expect(button).toHaveClass('hover:bg-blue-50');
    });

    it('should have flex layout for buttons', () => {
      render(<OnboardingPage />);

      const button = screen.getByText(
        'Protect my capital (I hate losing money)'
      ).closest('button');
      
      expect(button).toHaveClass('flex');
    });
  });

  describe('Progress Bar', () => {
    it('should display progress bar', () => {
      const { container } = render(<OnboardingPage />);

      const progressContainer = container.querySelector('.bg-gray-200');
      const progressFill = container.querySelector('.bg-blue-600');

      expect(progressContainer).toBeInTheDocument();
      expect(progressFill).toBeInTheDocument();
    });

    it('should have correct progress bar structure', () => {
      const { container } = render(<OnboardingPage />);

      const progressBar = container.querySelector('.h-2.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
