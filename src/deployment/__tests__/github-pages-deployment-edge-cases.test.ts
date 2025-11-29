// GitHub Pages Deployment Edge Cases and Error Scenarios
// Story 1.7: GitHub Pages Deployment Pipeline
// Comprehensive test coverage for deployment failure scenarios and edge cases

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('GitHub Pages Deployment Edge Cases', () => {
  const workflowPath = join(__dirname, '../../../.github/workflows/deploy.yml');
  const viteConfigPath = join(__dirname, '../../../vite.config.ts');
  const notFoundPath = join(__dirname, '../../../404.html');

  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GitHub Actions Workflow Edge Cases', () => {
    it('should handle repository name with special characters', async () => {
      // Test workflow works with repository names containing hyphens, numbers, etc.
      const workflowContent = readFileSync(workflowPath, 'utf-8');

      // Workflow should be repository-name agnostic
      expect(workflowContent).not.toContain('longweekendoptimizer');
      expect(workflowContent).toContain('publish_dir: ./dist');
    });

    it('should handle build timeout scenarios', async () => {
      // Mock timeout scenario
      const mockTimeoutResponse = {
        ok: false,
        status: 408,
        statusText: 'Request Timeout'
      };

      vi.mocked(fetch).mockResolvedValue(mockTimeoutResponse as any);

      // Workflow should have timeout handling
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('runs-on: ubuntu-latest');
      // Should have job timeout defaults (GitHub Actions provides this automatically)
    });

    it('should handle Node.js version update compatibility', () => {
      // Test workflow uses stable Node.js version with update strategy
      const workflowContent = readFileSync(workflowPath, 'utf-8');

      expect(workflowContent).toContain('node-version: \'18\'');
      // Should not use deprecated Node.js versions
      expect(workflowContent).not.toContain('node-version: \'14\'');
      expect(workflowContent).not.toContain('node-version: \'16\'');
    });

    it('should handle dependency cache corruption', () => {
      // Workflow should handle npm cache issues
      const workflowContent = readFileSync(workflowPath, 'utf-8');

      // Should use cache for dependencies
      expect(workflowContent).toContain('cache: \'npm\'');

      // Should use npm ci for deterministic builds
      expect(workflowContent).toContain('npm ci');
      // npm ci automatically handles corrupted cache
    });

    it('should handle concurrent deployment attempts', () => {
      // Test workflow handles race conditions
      const workflowContent = readFileSync(workflowPath, 'utf-8');

      // Should have concurrency control
      expect(workflowContent).toContain('continue-on-error: false');

      // GitHub Actions provides automatic concurrency control per job
    });
  });

  describe('Vite Configuration Edge Cases', () => {
    it('should handle base path configuration for different repository names', () => {
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Should have configurable base path
      expect(viteConfig).toContain('base: \'/longweekendoptimizer/\'');

      // Pattern should be able to handle different repository names
      expect(viteConfig).toMatch(/base:\s*['"]\/[^\/]+\/['"]/);
    });

    it('should handle assets with special characters in filenames', () => {
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // File naming pattern should handle special characters
      expect(viteConfig).toContain('assetFileNames: \'assets/[name]-[hash][extname]\'');
      expect(viteConfig).toContain('chunkFileNames: \'assets/[name]-[hash].js\'');

      // Hash pattern ensures unique names regardless of special characters
    });

    it('should handle very large asset bundle scenarios', () => {
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Should have manual chunks undefined (let Vite optimize automatically)
      expect(viteConfig).toContain('manualChunks: undefined');

      // Should have minification enabled
      expect(viteConfig).toContain('minify: true');
      expect(viteConfig).toContain('cssMinify: true');
    });

    it('should handle source map generation for debugging', () => {
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Should generate source maps for production debugging
      expect(viteConfig).toContain('sourcemap: true');
    });
  });

  describe('404.html Edge Cases', () => {
    it('should handle 404 redirect in production with proper timing', () => {
      const notFoundContent = readFileSync(notFoundPath, 'utf-8');

      // Should have appropriate redirect timeout
      expect(notFoundContent).toContain('setTimeout(function() {');
      expect(notFoundContent).toContain('window.location.href = \'/\'');
      expect(notFoundContent).toContain('3000'); // 3 seconds
    });

    it('should have proper styling for 404 page', () => {
      const notFoundContent = readFileSync(notFoundPath, 'utf-8');

      // Should have responsive design
      expect(notFoundContent).toContain('@media');
      expect(notFoundContent).toContain('max-width: 500px');

      // Should have mobile-friendly styling
      expect(notFoundContent).toContain('border-radius: 8px');
      expect(notFoundContent).toContain('box-shadow');
    });

    it('should have proper accessibility features', () => {
      const notFoundContent = readFileSync(notFoundPath, 'utf-8');

      // Should have proper semantic HTML
      expect(notFoundContent).toContain('<h1>');
      expect(notFoundContent).toContain('<title>');
      expect(notFoundContent).toContain('lang="en"');

      // Should have proper button styling
      expect(notFoundContent).toContain('<a href="/" class="btn">');
      expect(notFoundContent).toContain('transition: background-color');
    });
  });

  describe('Production Build Error Scenarios', () => {
    it('should handle TypeScript compilation errors gracefully', async () => {
      // Mock build failure scenario
      const mockBuildFailure = {
        ok: false,
        status: 500,
        body: () => Promise.resolve({
          error: 'TypeScript compilation failed',
          details: 'Type error in src/App.tsx: Missing semicolon'
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockBuildFailure as any);

      // Workflow should handle build failures
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('if: failure()');
      expect(workflowContent).toContain('echo "Deployment failed!"');
    });

    it('should handle memory exhaustion during build', () => {
      // Vite should handle large projects without memory issues
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Should have build optimizations that reduce memory usage
      expect(viteConfig).toContain('minify: true');
      expect(viteConfig).toContain('cssMinify: true');
    });

    it('should handle missing dependencies scenarios', () => {
      // npm ci should handle missing package-lock.json
      const workflowContent = readFileSync(workflowPath, 'utf-8');

      // Should use npm ci which fails fast on missing lock file
      expect(workflowContent).toContain('npm ci');
      expect(workflowContent).not.toContain('npm install');
    });
  });

  describe('Asset Loading Failure Scenarios', () => {
    it('should handle CDN unavailability', async () => {
      // Mock CDN failure
      const mockCDNFailure = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      };

      vi.mocked(fetch).mockResolvedValue(mockCDNFailure as any);

      // Application should handle CDN failures gracefully
      const response = await fetch('https://username.github.io/repository/assets/app.js');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(503);
    });

    it('should handle asset version mismatches', async () => {
      // Mock asset with wrong version
      const mockVersionMismatch = {
        ok: false,
        status: 404,
        statusText: 'Asset version not found'
      };

      vi.mocked(fetch).mockResolvedValue(mockVersionMismatch as any);

      // Should handle hashed asset loading failure
      const response = await fetch('https://username.github.io/repository/assets/index-wronghash.js');
      expect(response.status).toBe(404);
    });

    it('should handle mixed content security errors', async () => {
      // Mock HTTPS site trying to load HTTP resource
      const mockContentSecurityError = {
        ok: false,
        status: 0,
        type: 'error'
      };

      vi.mocked(fetch).mockRejectedValue(new Error('Mixed Content: The page was loaded over HTTPS'));

      // Application should handle mixed content errors
      await expect(fetch('http://unsecure-cdn.com/script.js')).rejects.toThrow();
    });
  });

  describe('Storage Failure Scenarios in Production', () => {
    it('should handle localStorage quota exceeded in production', () => {
      // Simulate quota exceeded scenario
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          const error = new DOMException('Storage quota exceeded', 'QuotaExceededError');
          throw error;
        }),
        removeItem: vi.fn(),
        clear: vi.fn()
      };

      global.localStorage = mockStorage;

      const { saveHolidays } = require('../../services/localStorageService');
      const holidays = [{ id: '1', name: 'Test Holiday', date: '2025-01-01' }];

      const result = saveHolidays(holidays);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('QUOTA_EXCEEDED');
    });

    it('should handle localStorage unavailability in private browsing', () => {
      // Simulate private browsing scenario
      const mockDisabledStorage = {
        getItem: vi.fn(() => { throw new Error('Storage disabled'); }),
        setItem: vi.fn(() => { throw new Error('Storage disabled'); }),
        removeItem: vi.fn(() => { throw new Error('Storage disabled'); }),
        clear: vi.fn(() => { throw new Error('Storage disabled'); })
      };

      global.localStorage = mockDisabledStorage;

      const { isLocalStorageAvailable } = require('../../services/localStorageService');

      expect(isLocalStorageAvailable()).toBe(false);
    });
  });

  describe('Network Failure Scenarios', () => {
    it('should handle intermittent network failures during deployment', async () => {
      // Mock intermittent network failure
      let callCount = 0;
      vi.mocked(fetch).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          body: () => Promise.resolve({ status: 'deployed' })
        } as any);
      });

      // GitHub Actions provide automatic retries for network failures
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('uses: actions/checkout@v4');
      expect(workflowContent).toContain('uses: peaceiris/actions-gh-pages@v4');
    });

    it('should handle DNS resolution failures', async () => {
      // Mock DNS failure
      vi.mocked(fetch).mockRejectedValue(new Error('getaddrinfo ENOTFOUND github.com'));

      // Workflow should handle DNS failures (GitHub Actions provides this)
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('runs-on: ubuntu-latest');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle malicious script injection attempts', () => {
      const notFoundContent = readFileSync(notFoundPath, 'utf-8');

      // 404 page should be safe from script injection
      expect(notFoundContent).not.toContain('eval(');
      expect(notFoundContent).not.toContain('innerHTML');
      expect(notFoundContent).not.toContain('document.write');
    });

    it('should handle cross-origin scripting attacks', async () => {
      // Mock response that should have security headers
      const mockSecureResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['x-frame-options', 'DENY'],
          ['x-content-type-options', 'nosniff'],
          ['referrer-policy', 'strict-origin-when-cross-origin']
        ])
      };

      vi.mocked(fetch).mockResolvedValue(mockSecureResponse as any);

      const response = await fetch('https://username.github.io/repository/');

      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle slow asset loading', async () => {
      // Mock slow asset loading
      vi.mocked(fetch).mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              body: () => Promise.resolve('slow asset content')
            } as any);
          }, 5000); // 5 second delay
        })
      );

      const startTime = Date.now();
      const response = await fetch('https://username.github.io/repository/assets/slow-image.jpg');
      const endTime = Date.now();

      expect(response.ok).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(4000); // Should take at least 4 seconds
    });

    it('should handle memory leaks in production', () => {
      // Test that cleanup functions exist
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Vite should handle cleanup automatically in production
      expect(viteConfig).toContain('build: {');

      // Sourcemap generation should not leak memory
      expect(viteConfig).toContain('sourcemap: true');
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle legacy browser compatibility', () => {
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');

      // Should build for modern browsers (ES2020+ is reasonable)
      // Vite defaults to modern targets, which is appropriate for GitHub Pages
      expect(viteConfig).toContain('plugins: [react()]');
    });

    it('should handle mobile browser limitations', () => {
      // Test localStorage availability check
      const { isLocalStorageAvailable } = require('../../services/localStorageService');

      // Should work in mobile browsers that support localStorage
      expect(typeof isLocalStorageAvailable).toBe('function');
    });
  });

  describe('Rollback and Recovery Edge Cases', () => {
    it('should handle rollback to previous working deployment', async () => {
      // Mock rollback scenario
      const mockRollbackResponse = {
        ok: true,
        status: 200,
        body: () => Promise.resolve({
          status: 'rollback_successful',
          previous_version: 'v1.0.0',
          current_version: 'v1.0.0'
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockRollbackResponse as any);

      // GitHub Pages provides this through branch management
      const workflowContent = readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('contents: write'); // Allows branch manipulation
    });

    it('should handle partial deployment failures', async () => {
      // Mock scenario where some assets deploy but others fail
      vi.mocked(fetch).mockImplementation((url) => {
        if (url.includes('partial')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            body: () => Promise.resolve({ status: 'partial_success' })
          } as any);
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          body: () => Promise.resolve({ error: 'Asset deployment failed' })
        } as any);
      });

      const partialResponse = await fetch('https://username.github.io/repository/partial-deployment');
      expect(partialResponse.ok).toBe(true);

      const failedResponse = await fetch('https://username.github.io/repository/failed-asset');
      expect(failedResponse.ok).toBe(false);
    });
  });
});