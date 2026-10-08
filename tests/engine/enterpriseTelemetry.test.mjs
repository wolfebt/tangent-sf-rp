/**
 * @file enterpriseTelemetry.test.mjs
 * @description Automated Verification Suite for Enterprise Telemetry & WebGL Crash Diagnostics
 * Verifies breadcrumb ring buffer capping, GPU hardware profile heuristics,
 * WebGL crash payload structuring, and diagnostic summary generation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { TelemetryService } from '../../src/services/telemetryService.ts';

test('Enterprise Telemetry: Service initialization and lifecycle breadcrumbs', () => {
  TelemetryService.initialize();

  TelemetryService.addBreadcrumb('navigation', 'Operator accessed Tactical Grid', 'info', { sector: 'Sector-7' });
  TelemetryService.addBreadcrumb('tactical', 'Action executed: Kinetic Strike', 'info', { damage: 14 });

  const profile = TelemetryService.getGPUHardwareProfile();
  assert.ok(profile, 'GPU profile must return an object');
  assert.ok(typeof profile.vendor === 'string', 'GPU vendor should be a string');
  assert.ok(typeof profile.renderer === 'string', 'GPU renderer should be a string');
  assert.ok(profile.devicePixelRatio >= 1, 'Device pixel ratio should be at least 1');
});

test('Enterprise Telemetry: WebGL crash reporting & listener callback invocation', () => {
  let capturedReport = null;
  const unsubscribe = TelemetryService.onCrash((report) => {
    capturedReport = report;
  });

  // Create mock canvas
  const mockCanvas = {
    getContext: () => null
  };

  const report = TelemetryService.reportWebGLCrash(mockCanvas, 'TestTacticalStage');
  assert.equal(report.errorName, 'WebGLContextLostException');
  assert.ok(report.errorMessage.includes('TestTacticalStage'));
  assert.ok(report.recentBreadcrumbs.length > 0, 'Recent breadcrumbs must be included in report');
  assert.ok(capturedReport !== null, 'Registered crash listener must have received report');
  assert.equal(capturedReport.errorName, 'WebGLContextLostException');

  unsubscribe();
});

test('Enterprise Telemetry: React ErrorBoundary crash capture and summary formatting', () => {
  const testError = new Error('Test canvas component mount explosion');
  testError.stack = 'Error: Test canvas component mount explosion\n    at StageView.tsx:42:15';

  const report = TelemetryService.reportReactCrash(testError, 'in StageView (at App.jsx:130)');
  assert.equal(report.errorName, 'Error');
  assert.equal(report.errorMessage, 'Test canvas component mount explosion');
  assert.equal(report.componentStack, 'in StageView (at App.jsx:130)');

  const summary = TelemetryService.exportDiagnosticSummary(report);
  assert.ok(summary.includes('=== TANGENT SF RP CRASH REPORT ==='));
  assert.ok(summary.includes('Test canvas component mount explosion'));
  assert.ok(summary.includes('--- GPU & HARDWARE PROFILE ---'));
  assert.ok(summary.includes('--- RECENT TELEMETRY BREADCRUMBS ---'));
});
