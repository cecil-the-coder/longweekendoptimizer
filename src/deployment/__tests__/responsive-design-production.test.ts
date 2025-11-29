// Responsive Design Production Tests
// Story 1.7: GitHub Pages Deployment Pipeline
// These tests validate that responsive design functions correctly on production hosting
// ATDD Approach: Tests will FAIL until production deployment is implemented

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JSDOM } from 'jsdom';

// Import components to test responsiveness
import App from '../../App';
import HolidayForm from '../../components/HolidayForm';
import RecommendationsSection from '../../components/RecommendationsSection';
import HolidayList from '../../components/HolidayList';

describe('AC6: Responsive design functions correctly on production hosting', () => {
  let dom: JSDOM;
  let container: HTMLElement;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'https://holidayhacker.app',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    container = dom.window.document.getElementById('root')!;

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Mobile Viewport Responsiveness', () => {
    beforeEach(() => {
      // Simulate mobile viewport
      Object.defineProperty(dom.window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(dom.window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should render mobile-optimized layout for holiday form', async () => {
      // This test will FAIL until mobile layout is implemented
      // Render holiday form component
      const { getByTestId, getByRole } = render(<HolidayForm onSubmit={vi.fn()} />);

      // Should have mobile-specific styling
      const form = getByTestId('holiday-form');
      expect(form).toHaveClass('mobile-form');

      // Input fields should be full-width on mobile
      const nameInput = getByRole('textbox', { name: /holiday name/i });
      const dateInput = getByRole('textbox', { name: /date/i });

      expect(nameInput).toHaveClass('mobile-input');
      expect(dateInput).toHaveClass('mobile-input');

      // Submit button should be prominent on mobile
      const submitButton = getByRole('button', { name: /add holiday/i });
      expect(submitButton).toHaveClass('mobile-button');
    });

    it('should have touch-friendly interface for holiday list', async () => {
      // This test will FAIL until touch optimization is implemented
      const holidays = [
        { id: '1', name: 'Christmas', date: '2024-12-25', type: 'public' as const }
      ];

      const { getByTestId } = render(<HolidayList holidays={holidays} />);

      const list = getByTestId('holiday-list');
      expect(list).toHaveClass('touch-optimized');

      // Holiday items should have adequate spacing for touch
      const items = list.querySelectorAll('[data-testid^="holiday-"]');
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveClass('touch-target');
    });

    it('should stack recommendations vertically on mobile screens', async () => {
      // This test will FAIL until responsive layout is implemented
      const recommendations = [
        {
          id: '1',
          title: 'Perfect 4-Day Weekend',
          startDate: '2024-12-21',
          endDate: '2024-12-24',
          description: 'Christmas creates a great opportunity'
        }
      ];

      const { getByTestId } = render(<RecommendationsSection recommendations={recommendations} />);

      const section = getByTestId('recommendations-section');
      expect(section).toHaveClass('mobile-layout');

      // Recommendation cards should be stacked
      const cards = section.querySelectorAll('[data-testid^="recommendation-card-"]');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0]).toHaveClass('mobile-card');
    });
  });

  describe('Tablet Viewport Responsiveness', () => {
    beforeEach(() => {
      // Simulate tablet viewport
      Object.defineProperty(dom.window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(dom.window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should use hybrid layout for tablet-form factor', async () => {
      // This test will FAIL until tablet layout is implemented
      const { getByTestId } = render(<App />);

      const app = getByTestId('app-container');
      expect(app).toHaveClass('tablet-layout');
    });
  });

  describe('Desktop Viewport Responsiveness', () => {
    beforeEach(() => {
      // Simulate desktop viewport
      Object.defineProperty(dom.window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      Object.defineProperty(dom.window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });
    });

    it('should use multi-column layout on wide screens', async () => {
      // This test will FAIL until desktop layout is implemented
      const { getByTestId } = render(<App />);

      const app = getByTestId('app-container');
      expect(app).toHaveClass('desktop-layout');

      // Should have sidebar or side-by-side layout
      const sidebar = dom.window.document.querySelector('[data-testid="sidebar"]');
      expect(sidebar).toBeTruthy();
    });
  });

  describe('Responsive Breakpoints', () => {
    it('should have proper CSS breakpoints defined', () => {
      // This test will FAIL until responsive CSS is implemented
      const styles = dom.window.getComputedStyle(dom.window.document.body);

      // Should have responsive breakpoint variables
      const rootStyles = dom.window.getComputedStyle(dom.window.document.documentElement);
      expect(rootStyles.getPropertyValue('--mobile-breakpoint')).toBeTruthy();
      expect(rootStyles.getPropertyValue('--tablet-breakpoint')).toBeTruthy();
      expect(rootStyles.getPropertyValue('--desktop-breakpoint')).toBeTruthy();
    });

    it('should handle orientation changes gracefully', async () => {
      // This test will FAIL until orientation handling is implemented
      // Start with portrait
      Object.defineProperty(dom.window, 'innerWidth', { value: 375 });
      Object.defineProperty(dom.window, 'innerHeight', { value: 667 });

      const { getByTestId } = render(<App />);
      const app = getByTestId('app-container');

      // Switch to landscape
      Object.defineProperty(dom.window, 'innerWidth', { value: 667 });
      Object.defineProperty(dom.window, 'innerHeight', { value: 375 });

      // Trigger resize
      dom.window.dispatchEvent(new dom.window.Event('resize'));

      // Should handle orientation change
      expect(app).toHaveClass('orientation-landscape');
    });
  });

  describe('Performance in Production Environment', () => {
    it('should have responsive images that load appropriately', async () => {
      // This test will FAIL until responsive images are implemented
      const images = dom.window.document.querySelectorAll('img[data-srcset]');
      expect(images.length).toBeGreaterThan(0);

      // Check srcset attributes for responsive loading
      images.forEach(img => {
        const srcset = img.getAttribute('srcset');
        expect(srcset).toBeTruthy();
        expect(srcset).toContain('320w');
        expect(srcset).toContain('768w');
        expect(srcset).toContain('1200w');
      });
    });

    it('should have touch gestures working on mobile devices', async () => {
      // This test will FAIL until touch gestures are implemented
      const { getByTestId } = render(<HolidayList holidays={[]} />);

      const list = getByTestId('holiday-list');

      // Should support swipe gestures on mobile
      expect(list.getAttribute('data-touch-enabled')).toBe('true');

      // Simulate touch events
      list.dispatchEvent(new dom.window.TouchEvent('touchstart'));
      list.dispatchEvent(new dom.window.TouchEvent('touchmove'));
      list.dispatchEvent(new dom.window.TouchEvent('touchend'));
    });

    it('should have proper viewport scaling for high-DPI displays', async () => {
      // This test will FAIL until DPI scaling is implemented
      const viewport = dom.window.document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      expect(viewport).toBeTruthy();
      expect(viewport.content).toContain('width=device-width, initial-scale=1.0');

      // Should have proper scaling for retina displays
      const dpr = dom.window.devicePixelRatio;
      expect(dpr).toBeGreaterThan(1);
    });
  });

  describe('Production Environment Validation', () => {
    it('should load responsive CSS from GitHub Pages', async () => {
      // This test will FAIL until deployment is complete
      const cssLink = dom.window.document.querySelector('link[rel="stylesheet"]') as HTMLLinkElement;
      expect(cssLink).toBeTruthy();
      expect(cssLink.href).toContain('/assets/');

      // CSS should load successfully
      const response = await fetch(cssLink.href);
      expect(response.ok).toBe(true);
    });

    it('should have responsive meta tags for mobile browsers', () => {
      // This test will FAIL until mobile optimization is complete
      const viewport = dom.window.document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      expect(viewport).toBeTruthy();
      expect(viewport.content).toContain('width=device-width');
      expect(viewport.content).toContain('initial-scale=1.0');
      expect(viewport.content).toContain('user-scalable=no');

      const appleMobileWebApp = dom.window.document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      expect(appleMobileWebApp).toBeTruthy();
      expect(appleMobileWebApp?.getAttribute('content')).toBe('yes');
    });

    it('should have proper responsive breakpoints tested on production URL', async () => {
      // This test will FAIL until production deployment is accessible
      const productionUrl = 'https://holidayhacker.app';

      // Test different viewports on production
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1200, height: 800 }  // Desktop
      ];

      for (const viewport of viewports) {
        Object.defineProperty(dom.window, 'innerWidth', { value: viewport.width });
        Object.defineProperty(dom.window, 'innerHeight', { value: viewport.height });

        const response = await fetch(productionUrl);
        expect(response.ok).toBe(true);

        const html = await response.text();
        expect(html).toContain('HolidayHacker');
      }
    });
  });
});