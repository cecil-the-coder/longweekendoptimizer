// Notification Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing notification display, types, dismiss functionality, and auto-dismiss

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notification from '../Notification';

describe('Notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering Different Notification Types', () => {
    it('should render success notification with correct styling', () => {
      render(
        <Notification
          type="success"
          message="Holiday added successfully!"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveClass('bg-green-100', 'border-green-400', 'text-green-700');
      expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();

      // Should have success icon
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });

    it('should render error notification with correct styling', () => {
      render(
        <Notification
          type="error"
          message="Failed to add holiday"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveClass('bg-red-100', 'border-red-400', 'text-red-700');
      expect(screen.getByText('Failed to add holiday')).toBeInTheDocument();

      // Should have error icon
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should render warning notification with correct styling', () => {
      render(
        <Notification
          type="warning"
          message="Storage space is running low"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveClass('bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
      expect(screen.getByText('Storage space is running low')).toBeInTheDocument();

      // Should have warning icon
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('should render info notification with correct styling', () => {
      render(
        <Notification
          type="info"
          message="Holiday recommendations updated"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveClass('bg-blue-100', 'border-blue-400', 'text-blue-700');
      expect(screen.getByText('Holiday recommendations updated')).toBeInTheDocument();

      // Should have info icon
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should not show dismiss button when dismissible is false', () => {
      render(
        <Notification
          type="success"
          message="Non-dismissible notification"
          dismissible={false}
          data-testid="notification"
        />
      );

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId('dismiss-button')).not.toBeInTheDocument();
    });

    it('should show dismiss button when dismissible is true (default)', () => {
      render(
        <Notification
          type="success"
          message="Dismissible notification"
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Test notification"
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible via Enter key', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Test notification"
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      dismissButton.focus();
      await userEvent.keyboard('{Enter}');

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible via Space key', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Test notification"
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      dismissButton.focus();
      await userEvent.keyboard('{ }');

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not call onDismiss when dismissible is false and button clicked', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Non-dismissible notification"
          dismissible={false}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Should not have dismiss button to click
      expect(screen.queryByRole('button', { name: /dismiss notification/i })).not.toBeInTheDocument();
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Auto-Dismiss Functionality', () => {
    it('should not auto-dismiss when autoDismiss is not provided', () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Non auto-dismissing notification"
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Advance timers significantly
      vi.advanceTimersByTime(10000);

      expect(onDismiss).not.toHaveBeenCalled();
      expect(screen.getByTestId('notification')).toBeInTheDocument();
    });

    it('should auto-dismiss after specified time', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Auto-dismissing notification"
          autoDismiss={3000}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Should not be dismissed immediately
      expect(onDismiss).not.toHaveBeenCalled();
      expect(screen.getByTestId('notification')).toBeInTheDocument();

      // Advance timers to just before auto-dismiss
      vi.advanceTimersByTime(2999);
      expect(onDismiss).not.toHaveBeenCalled();

      // Advance timers past auto-dismiss time
      vi.advanceTimersByTime(1);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default auto-dismiss time of 5 seconds when autoDismiss is true', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Default auto-dismiss notification"
          autoDismiss={true}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Advance timers to just before 5 seconds
      vi.advanceTimersByTime(4999);
      expect(onDismiss).not.toHaveBeenCalled();

      // Advance timers past 5 seconds
      vi.advanceTimersByTime(1);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should not auto-dismiss if user manually dismisses first', async () => {
      const onDismiss = vi.fn();

      render(
        <Notification
          type="success"
          message="Notification with both dismiss options"
          autoDismiss={3000}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Manually dismiss before auto-dismiss time
      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);

      // Advance timers past auto-dismiss time
      vi.advanceTimersByTime(5000);

      // Should still only be called once (manual dismiss)
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should clear auto-dismiss timer when component unmounts', () => {
      const onDismiss = vi.fn();
      const { unmount } = render(
        <Notification
          type="success"
          message="Test notification"
          autoDismiss={3000}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      // Unmount before auto-dismiss
      unmount();

      // Advance timers past auto-dismiss time
      vi.advanceTimersByTime(5000);

      // Should not have been called since component unmounted
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for live regions', () => {
      render(
        <Notification
          type="success"
          message="Accessible notification"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toHaveAttribute('role', 'alert');
      expect(notification).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA attributes for dismissible notifications', () => {
      render(
        <Notification
          type="success"
          message="Dismissible notification"
          dismissible={true}
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('should include dismiss button in tab order when dismissible', () => {
      render(
        <Notification
          type="success"
          message="Test notification"
          dismissible={true}
          data-testid="notification"
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      expect(dismissButton).not.toHaveAttribute('tabIndex', '-1');
    });

    it('should announce notification content to screen readers', () => {
      render(
        <Notification
          type="error"
          message="Important error message"
          data-testid="notification"
        />
      );

      const notification = screen.getByTestId('notification');
      expect(notification).toHaveAttribute('role', 'alert');

      // Should be visible to screen readers
      expect(screen.getByText('Important error message')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle updating notification type', () => {
      const { rerender } = render(
        <Notification
          type="success"
          message="Initial success message"
          data-testid="notification"
        />
      );

      expect(screen.getByTestId('notification')).toHaveClass('bg-green-100');

      rerender(
        <Notification
          type="error"
          message="Updated error message"
          data-testid="notification"
        />
      );

      expect(screen.getByTestId('notification')).toHaveClass('bg-red-100');
      expect(screen.getByText('Updated error message')).toBeInTheDocument();
    });

    it('should handle updating dismissible state', () => {
      const { rerender } = render(
        <Notification
          type="success"
          message="Initially dismissible"
          dismissible={true}
          data-testid="notification"
        />
      );

      expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();

      rerender(
        <Notification
          type="success"
          message="Now non-dismissible"
          dismissible={false}
          data-testid="notification"
        />
      );

      expect(screen.queryByRole('button', { name: /dismiss notification/i })).not.toBeInTheDocument();
    });

    it('should handle updating auto-dismiss settings', async () => {
      const onDismiss = vi.fn();
      const { rerender } = render(
        <Notification
          type="success"
          message="No auto-dismiss"
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      vi.advanceTimersByTime(10000);
      expect(onDismiss).not.toHaveBeenCalled();

      rerender(
        <Notification
          type="success"
          message="Now with auto-dismiss"
          autoDismiss={2000}
          onDismiss={onDismiss}
          data-testid="notification"
        />
      );

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle empty message gracefully', () => {
      expect(() => {
        render(
          <Notification
            type="success"
            message=""
            data-testid="notification"
          />
        );
      }).not.toThrow();

      expect(screen.queryByText(/\S/)).not.toBeInTheDocument(); // No non-whitespace text
    });

    it('should handle long messages by wrapping text', () => {
      const longMessage = 'This is a very long notification message that should wrap properly and not cause layout issues or overflow the container boundaries in any way shape or form regardless of the screen size or viewport dimensions being used for testing purposes';

      render(
        <Notification
          type="info"
          message={longMessage}
          data-testid="notification"
        />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
      expect(screen.getByTestId('notification')).toBeInTheDocument();
    });

    it('should handle messages with HTML entities', () => {
      render(
        <Notification
          type="warning"
          message="Warning: Storage quota exceeded (>5MB). Please clear some data."
          data-testid="notification"
        />
      );

      expect(screen.getByText('Warning: Storage quota exceeded (>5MB). Please clear some data.')).toBeInTheDocument();
    });
  });
});