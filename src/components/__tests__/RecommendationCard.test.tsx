// Recommendation Card Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing individual recommendation display with different recommendation types

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationCard from '../RecommendationCard';
import { Recommendation } from '../../utils/dateLogic';

describe('RecommendationCard', () => {
  const mockRecommendation: Recommendation = {
    holidayName: 'Thanksgiving',
    holidayDate: '2025-11-27',
    holidayDayOfWeek: 'Thursday',
    recommendedDate: '2025-11-28',
    recommendedDay: 'Friday',
    explanation: '→ 4-day weekend'
  };

  const tuesdayRecommendation: Recommendation = {
    holidayName: 'Election Day',
    holidayDate: '2025-11-04', // Tuesday
    holidayDayOfWeek: 'Tuesday',
    recommendedDate: '2025-11-03', // Monday
    recommendedDay: 'Monday',
    explanation: '→ 4-day weekend'
  };

  describe('Rendering with Thursday/Friday Recommendation', () => {
    it('should display holiday name and date with proper formatting', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByText('For')).toBeInTheDocument();
      expect(screen.getByText('Thanksgiving')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      expect(screen.getByText('Thursday, Nov 27, 2025')).toBeInTheDocument();
    });

    it('should display recommended day off with proper formatting', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByText(/Take off:/i)).toBeInTheDocument();
      expect(screen.getByText(/Friday, Nov 28, 2025/i)).toBeInTheDocument();
    });

    it('should display explanation text for 4-day weekend', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByText(/→ 4-day weekend/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels for accessibility', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Recommendation for Thanksgiving');
    });

    it('should have responsive design classes', () => {
      const { container } = render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(container.firstChild).toHaveClass('bg-green-50', 'border-green-200', 'rounded-lg');
      expect(container.firstChild).toHaveClass('hover:bg-green-100', 'transition-colors');
    });
  });

  describe('Rendering with Tuesday/Monday Recommendation', () => {
    it('should render Tuesday holiday recommendation correctly', () => {
      render(<RecommendationCard recommendation={tuesdayRecommendation} />);

      expect(screen.getByText('For')).toBeInTheDocument();
      expect(screen.getByText('Election Day')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      expect(screen.getByText('Tuesday, Nov 4, 2025')).toBeInTheDocument();
    });

    it('should display Monday recommendation for Tuesday holiday', () => {
      render(<RecommendationCard recommendation={tuesdayRecommendation} />);

      expect(screen.getByText('Take off:')).toBeInTheDocument();
      expect(screen.getByText('Monday, Nov 3, 2025')).toBeInTheDocument();
    });

    it('should display explanation for Monday recommendation', () => {
      render(<RecommendationCard recommendation={tuesdayRecommendation} />);

      expect(screen.getByText('→ 4-day weekend')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should display checkmark icon', () => {
      const { container } = render(<RecommendationCard recommendation={mockRecommendation} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      const iconContainer = container.querySelector('div[aria-hidden="true"]');
      expect(iconContainer).toHaveClass('bg-green-600', 'rounded-full');
    });

    it('should use appropriate color scheme for recommendations', () => {
      const { container } = render(<RecommendationCard recommendation={mockRecommendation} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-green-50', 'border-green-200');

      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-green-900');

      const explanation = screen.getByText('→ 4-day weekend');
      expect(explanation).toHaveClass('text-green-700');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable with proper semantic HTML', () => {
      const { container } = render(<RecommendationCard recommendation={mockRecommendation} />);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-label');
    });

    it('should have properly structured content for screen readers', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });
});