import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import ModeToggle from '../ModeToggle';
import ErrorBoundary from '../ErrorBoundary';

describe('React Component DOM Rendering Tests', () => {

  // App Component Tests
  describe('App Component', () => {
    it('should render the FIFA 2026 NEXUS logo text', () => {
      render(<App />);
      expect(screen.getByText('NEXUS')).toBeInTheDocument();
      expect(screen.getByText('FIFA 2026')).toBeInTheDocument();
    });

    it('should render the theme selector dropdown', () => {
      render(<App />);
      const themeSelect = screen.getByLabelText('Select Theme Mode');
      expect(themeSelect).toBeInTheDocument();
      expect(themeSelect.value).toBe('dark');
    });

    it('should render the persona toggle button', () => {
      render(<App />);
      const toggleBtn = screen.getByLabelText('Toggle Persona Mode');
      expect(toggleBtn).toBeInTheDocument();
    });

    it('should start in fan mode by default', () => {
      const { container } = render(<App />);
      const appContainer = container.querySelector('.app-container');
      expect(appContainer).toHaveClass('fan-mode');
    });

    it('should switch to staff mode when toggle is clicked', () => {
      const { container } = render(<App />);
      const toggleBtn = screen.getByLabelText('Toggle Persona Mode');
      fireEvent.click(toggleBtn);
      const appContainer = container.querySelector('.app-container');
      expect(appContainer).toHaveClass('staff-mode');
    });

    it('should switch theme when dropdown value changes', () => {
      render(<App />);
      const themeSelect = screen.getByLabelText('Select Theme Mode');
      fireEvent.change(themeSelect, { target: { value: 'light' } });
      expect(themeSelect.value).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  // ModeToggle Component Tests
  describe('ModeToggle Component', () => {
    it('should render Fan and Staff labels', () => {
      render(<ModeToggle currentMode="fan" onToggle={() => {}} />);
      expect(screen.getByText('Fan')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
    });

    it('should highlight the active mode label', () => {
      const { container } = render(<ModeToggle currentMode="fan" onToggle={() => {}} />);
      const labels = container.querySelectorAll('.toggle-label');
      expect(labels[0]).toHaveClass('active'); // Fan label
      expect(labels[1]).not.toHaveClass('active'); // Staff label
    });

    it('should call onToggle with staff when in fan mode and clicked', () => {
      let toggled = '';
      render(<ModeToggle currentMode="fan" onToggle={(val) => { toggled = val; }} />);
      const toggleBtn = screen.getByLabelText('Toggle Persona Mode');
      fireEvent.click(toggleBtn);
      expect(toggled).toBe('staff');
    });

    it('should call onToggle with fan when in staff mode and clicked', () => {
      let toggled = '';
      render(<ModeToggle currentMode="staff" onToggle={(val) => { toggled = val; }} />);
      const toggleBtn = screen.getByLabelText('Toggle Persona Mode');
      fireEvent.click(toggleBtn);
      expect(toggled).toBe('fan');
    });
  });

  // ErrorBoundary Component Tests
  describe('ErrorBoundary Component', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Safe content</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('should display error fallback UI when a child throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test crash');
      };
      
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/SYSTEM ERROR/)).toBeInTheDocument();
      expect(screen.getByText(/Test crash/)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should render the Reload Application button in error state', () => {
      const ThrowingComponent = () => {
        throw new Error('Reload test');
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByLabelText('Reload Application')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  // Sanitization Security Tests (service-level)
  describe('Input Sanitization Security', () => {
    it('should strip script tags from user input via sanitizeInput', async () => {
      const { sanitizeInput } = await import('../../services/aiService');
      const malicious = '<script>alert("xss")</script>Hello';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('</script>');
      expect(cleaned).toBe('alert("xss")Hello');
    });

    it('should strip HTML tags from user input', async () => {
      const { sanitizeInput } = await import('../../services/aiService');
      const htmlInput = '<b>bold</b> and <img src=x onerror=alert(1)>';
      const cleaned = sanitizeInput(htmlInput);
      expect(cleaned).not.toContain('<b>');
      expect(cleaned).not.toContain('<img');
      expect(cleaned).toBe('bold and');
    });
  });
});
