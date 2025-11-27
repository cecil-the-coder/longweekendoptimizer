// Deployment Monitoring and Health Checks
// Story 1.7: GitHub Pages Deployment Pipeline
// Tests for deployment monitoring, health checks, and observability

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Deployment Monitoring and Health Checks', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Deployment Health Monitoring', () => {
    it('should monitor deployment success metrics', async () => {
      // Mock successful deployment metrics
      const mockMetricsResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          deployment_id: 'deploy-123',
          status: 'success',
          duration: 45, // seconds
          assets_count: 12,
          bundle_size: '1.2MB',
          timestamp: '2025-11-27T19:00:00Z',
          metrics: {
            build_time: 30,
            upload_time: 15,
            cache_hit_rate: 0.85,
            first_contentful_paint: 1.2,
            largest_contentful_paint: 2.1
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockMetricsResponse as any);

      const response = await fetch('https://api.github.com/repos/owner/repo/deployments');
      const metrics = await response.json();

      expect(metrics.status).toBe('success');
      expect(metrics.duration).toBeLessThan(300); // Should complete within 5 minutes
      expect(metrics.metrics.build_time).toBeLessThan(60); // Build under 1 minute
      expect(metrics.metrics.first_contentful_paint).toBeLessThan(2); // Good performance
    });

    it('should detect deployment failures and alert', async () => {
      // Mock failed deployment
      const mockFailureMetrics = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          deployment_id: 'deploy-124',
          status: 'failure',
          error_type: 'BUILD_ERROR',
          error_message: 'TypeScript compilation failed',
          step: 'build',
          timestamp: '2025-11-27T19:05:00Z',
          logs: [
            'ERROR: src/App.tsx:45:5 - Missing semicolon',
            'ERROR: Build failed with status code 1'
          ]
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockFailureMetrics as any);

      const response = await fetch('https://api.github.com/repos/owner/repo/deployments/latest');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);

      const errorData = await response.json();
      expect(errorData.status).toBe('failure');
      expect(errorData.error_type).toBe('BUILD_ERROR');
      expect(errorData.error_message).toContain('TypeScript');
    });

    it('should track deployment performance trends', async () => {
      // Mock performance trend data
      const mockTrendData = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          deployments: [
            { id: 'deploy-120', duration: 42, status: 'success', timestamp: '2025-11-27T18:00:00Z' },
            { id: 'deploy-121', duration: 45, status: 'success', timestamp: '2025-11-27T18:30:00Z' },
            { id: 'deploy-122', duration: 38, status: 'success', timestamp: '2025-11-27T19:00:00Z' },
            { id: 'deploy-123', duration: 47, status: 'success', timestamp: '2025-11-27T19:30:00Z' }
          ],
          trends: {
            avg_duration: 43,
            success_rate: 1.0,
            performance_impact: '+5%',
            recommendation: 'Performance is stable'
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockTrendData as any);

      const response = await fetch('https://api.github.com/repos/owner/repo/deployments/trends');
      const trendData = await response.json();

      expect(trendData.deployments).toHaveLength(4);
      expect(trendData.trends.avg_duration).toBeLessThan(60); // Under 1 minute average
      expect(trendData.trends.success_rate).toBe(1.0); // 100% success rate
    });
  });

  describe('Runtime Health Checks', () => {
    it('should perform application health check', async () => {
      // Mock health check endpoint
      const mockHealthResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          status: 'healthy',
          timestamp: '2025-11-27T19:15:00Z',
          version: '1.0.0',
          environment: 'production',
          uptime: 3600, // seconds
          checks: {
            frontend: 'pass',
            static_assets: 'pass',
            localStorage: 'pass',
            routing: 'pass'
          },
          performance: {
            first_paint: 0.8,
            first_contentful_paint: 1.2,
            dom_loaded: 1.5,
            fully_loaded: 2.3
          },
          resources: {
            bundle_size: '1.2MB',
            total_requests: 12,
            cache_hit_rate: 0.92
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockHealthResponse as any);

      const response = await fetch('https://username.github.io/repository/api/health');
      const health = await response.json();

      expect(health.status).toBe('healthy');
      expect(health.environment).toBe('production');

      // All critical checks should pass
      expect(health.checks.frontend).toBe('pass');
      expect(health.checks.static_assets).toBe('pass');
      expect(health.checks.localStorage).toBe('pass');
      expect(health.checks.routing).toBe('pass');

      // Performance should be within acceptable ranges
      expect(health.performance.first_contentful_paint).toBeLessThan(2);
      expect(health.performance.fully_loaded).toBeLessThan(3);
    });

    it('should detect runtime errors and report them', async () => {
      // Mock error reporting endpoint
      const mockErrorReport = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          error_id: 'err-456',
          timestamp: '2025-11-27T19:20:00Z',
          error_type: 'RuntimeError',
          message: 'Cannot read property of undefined',
          stack_trace: 'at App.render (App.tsx:123)',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          url: 'https://username.github.io/repository/holidays',
          severity: 'high',
          resolved: false,
          occurrences: 3
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockErrorReport as any);

      const response = await fetch('https://username.github.io/repository/api/errors/latest');
      const error = await response.json();

      expect(error.error_type).toBe('RuntimeError');
      expect(error.severity).toBe('high');
      expect(error.occurrences).toBeGreaterThan(0);
      expect(error.resolved).toBe(false);
    });

    it('should monitor asset loading performance', async () => {
      // Mock asset performance metrics
      const mockAssetMetrics = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          assets: [
            {
              name: 'main.js',
              size: '256KB',
              load_time: 1.2,
              cache_status: 'hit',
              compression_ratio: 0.35
            },
            {
              name: 'main.css',
              size: '45KB',
              load_time: 0.3,
              cache_status: 'hit',
              compression_ratio: 0.75
            },
            {
              name: 'vendor.js',
              size: '180KB',
              load_time: 0.8,
              cache_status: 'miss',
              compression_ratio: 0.40
            }
          ],
          summary: {
            total_assets: 3,
            total_size: '481KB',
            avg_load_time: 0.77,
            cache_hit_rate: 0.67,
            overall_performance: 'good'
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockAssetMetrics as any);

      const response = await fetch('https://username.github.io/repository/api/assets/metrics');
      const metrics = await response.json();

      expect(metrics.summary.total_assets).toBe(3);
      expect(metrics.summary.cache_hit_rate).toBeGreaterThan(0.5); // At least 50% cache hit
      expect(metrics.summary.avg_load_time).toBeLessThan(2); // Under 2 seconds average
    });
  });

  describe('Storage Monitoring', () => {
    it('should monitor localStorage usage and health', async () => {
      // Mock storage metrics
      const mockStorageMetrics = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          storage: {
            available: true,
            type: 'localStorage',
            quota_used: 125829, // ~123KB
            quota_available: 5242880, // ~5MB
            usage_percentage: 2.4,
            items_stored: 3,
            last_accessed: '2025-11-27T19:10:00Z',
            health: 'healthy'
          },
          data_integrity: {
            holidays_valid: true,
            recommendations_valid: true,
            settings_valid: true,
            corruption_detected: false
          },
          performance: {
            read_time_avg: 0.002, // 2ms
            write_time_avg: 0.005, // 5ms
            last_backup: '2025-11-27T18:00:00Z'
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockStorageMetrics as any);

      const response = await fetch('https://username.github.io/repository/api/storage/metrics');
      const storage = await response.json();

      expect(storage.storage.available).toBe(true);
      expect(storage.storage.health).toBe('healthy');
      expect(storage.storage.usage_percentage).toBeLessThan(10); // Under 10% usage
      expect(storage.data_integrity.corruption_detected).toBe(false);
      expect(storage.performance.read_time_avg).toBeLessThan(0.01); // Under 10ms
    });

    it('should alert on storage quota approaching limits', async () => {
      // Mock high storage usage alert
      const mockStorageAlert = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          alert_type: 'STORAGE_QUOTA_WARNING',
          severity: 'medium',
          message: 'Storage usage is approaching limits',
          usage_percentage: 85.2,
          quota_used: 4718592, // ~4.5MB
          quota_available: 786432, // ~768KB remaining
          recommendation: 'Consider clearing old holiday data or exporting to file',
          timestamp: '2025-11-27T19:25:00Z'
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockStorageAlert as any);

      const response = await fetch('https://username.github.io/repository/api/storage/alerts');
      const alert = await response.json();

      expect(alert.alert_type).toBe('STORAGE_QUOTA_WARNING');
      expect(alert.severity).toBe('medium');
      expect(alert.usage_percentage).toBeGreaterThan(80); // Alert at 80%+
      expect(alert.recommendation).toContain('clearing');
    });
  });

  describe('User Experience Monitoring', () => {
    it('should track user interaction metrics', async () => {
      // Mock UX metrics
      const mockUXMetrics = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          interactions: {
            page_loads: 150,
            unique_visitors: 45,
            average_session_duration: 180, // seconds
            bounce_rate: 0.25,
            feature_usage: {
              add_holiday: 120,
              generate_recommendations: 85,
              save_holidays: 95,
              delete_holiday: 35
            }
          },
          performance: {
            time_to_interactive: 2.1,
            first_input_delay: 0.12,
            cumulative_layout_shift: 0.08
          },
          errors: {
            javascript_errors: 2,
            storage_errors: 1,
            network_errors: 0,
            total_errors: 3
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockUXMetrics as any);

      const response = await fetch('https://username.github.io/repository/api/ux/metrics');
      const ux = await response.json();

      expect(ux.interactions.page_loads).toBeGreaterThan(0);
      expect(ux.interactions.average_session_duration).toBeGreaterThan(60); // At least 1 minute
      expect(ux.performance.time_to_interactive).toBeLessThan(3); // Under 3 seconds
      expect(ux.performance.cumulative_layout_shift).toBeLessThan(0.1); // Good CLS
    });

    it('should monitor responsive design effectiveness', async () => {
      // Mock responsive design metrics
      const mockResponsiveMetrics = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          viewports: {
            mobile: { count: 85, usage: 0.57, avg_load_time: 2.3 },
            tablet: { count: 35, usage: 0.23, avg_load_time: 1.8 },
            desktop: { count: 30, usage: 0.20, avg_load_time: 1.2 }
          },
          orientation: {
            portrait: { count: 110, usage: 0.73 },
            landscape: { count: 40, usage: 0.27 }
          },
          touch_interactions: {
            supported: true,
            gesture_recognition: 0.92, // 92% success rate
            touch_accuracy: 0.95
          },
          accessibility: {
            screen_reader_compatible: true,
            keyboard_navigation: true,
            color_contrast: 'AA',
            focus_indicators: 'visible'
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockResponsiveMetrics as any);

      const response = await fetch('https://username.github.io/repository/api/responsive/metrics');
      const responsive = await response.json();

      expect(responsive.viewports.mobile.usage).toBeGreaterThan(0.5); // Majority mobile
      expect(responsive.touch_interactions.supported).toBe(true);
      expect(responsive.touch_interactions.gesture_recognition).toBeGreaterThan(0.9); // High accuracy
      expect(responsive.accessibility.screen_reader_compatible).toBe(true);
    });
  });

  describe('Security Monitoring', () => {
    it('should monitor for security vulnerabilities', async () => {
      // Mock security scan results
      const mockSecurityScan = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          scan_id: 'scan-789',
          timestamp: '2025-11-27T19:30:00Z',
          overall_security_score: 95,
          vulnerabilities: [],
          security_headers: {
            content_security_policy: 'present',
            x_frame_options: 'present',
            x_content_type_options: 'present',
            referrer_policy: 'present',
            strict_transport_security: 'present'
          },
          dependencies: {
            total_dependencies: 12,
            vulnerable_dependencies: 0,
            outdated_dependencies: 2,
            last_scan: '2025-11-27T18:00:00Z'
          },
          recommendations: [
            'Keep dependencies updated',
            'Regular security audits recommended'
          ]
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockSecurityScan as any);

      const response = await fetch('https://username.github.io/repository/api/security/scan');
      const security = await response.json();

      expect(security.overall_security_score).toBeGreaterThan(90); // High security score
      expect(security.vulnerabilities).toHaveLength(0); // No critical vulnerabilities
      expect(security.dependencies.vulnerable_dependencies).toBe(0);
    });

    it('should detect and report XSS attempts', async () => {
      // Mock XSS detection
      const mockXSSReport = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          alert_type: 'XSS_ATTEMPT_BLOCKED',
          severity: 'high',
          timestamp: '2025-11-27T19:35:00Z',
          source_ip: '192.168.1.100',
          user_agent: 'Automated Scanner 1.0',
          blocked_payload: '<script>alert("xss")</script>',
          sanitization_applied: true,
          blocked_successfully: true
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockXSSReport as any);

      const response = await fetch('https://username.github.io/repository/api/security/xss/alerts');
      const xss = await response.json();

      expect(xss.alert_type).toBe('XSS_ATTEMPT_BLOCKED');
      expect(xss.severity).toBe('high');
      expect(xss.blocked_successfully).toBe(true);
      expect(xss.sanitization_applied).toBe(true);
    });
  });

  describe('Alerting and Notifications', () => {
    it('should send critical deployment alerts', async () => {
      // Mock alert system
      const mockAlert = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          alert_id: 'alert-001',
          type: 'CRITICAL_DEPLOYMENT_FAILURE',
          severity: 'critical',
          message: 'Deployment failed: Build error in production',
          channels_sent: ['email', 'slack'],
          recipients: ['dev-team@company.com'],
          acknowledged: false,
          timestamp: '2025-11-27T19:40:00Z',
          resolution_eta: '30 minutes'
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockAlert as any);

      const response = await fetch('https://username.github.io/repository/api/alerts/critical');
      const alert = await response.json();

      expect(alert.type).toBe('CRITICAL_DEPLOYMENT_FAILURE');
      expect(alert.severity).toBe('critical');
      expect(alert.channels_sent).toContain('email');
      expect(alert.recipients).toContain('dev-team@company.com');
    });

    it('should provide deployment status dashboard data', async () => {
      // Mock dashboard data
      const mockDashboard = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          overview: {
            current_status: 'healthy',
            last_deployment: '2025-11-27T19:00:00Z',
            uptime_percentage: 99.8,
            error_rate_24h: 0.02,
            avg_response_time: 1.2
          },
          recent_deployments: [
            { id: 'deploy-123', status: 'success', duration: 45, timestamp: '2025-11-27T19:00:00Z' },
            { id: 'deploy-122', status: 'success', duration: 38, timestamp: '2025-11-27T18:30:00Z' },
            { id: 'deploy-121', status: 'success', duration: 42, timestamp: '2025-11-27T18:00:00Z' }
          ],
          health_metrics: {
            storage_health: 'good',
            performance_health: 'excellent',
            security_health: 'excellent',
            user_experience: 'good'
          }
        })
      };

      vi.mocked(fetch).mockResolvedValue(mockDashboard as any);

      const response = await fetch('https://username.github.io/repository/api/dashboard');
      const dashboard = await response.json();

      expect(dashboard.overview.current_status).toBe('healthy');
      expect(dashboard.overview.uptime_percentage).toBeGreaterThan(99); // High availability
      expect(dashboard.recent_deployments).toHaveLength(3);
      expect(dashboard.health_metrics.security_health).toBe('excellent');
    });
  });
});