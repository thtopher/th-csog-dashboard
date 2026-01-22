import { describe, it, expect } from 'vitest';
import { getMetricStatus, ScorecardMetric } from '../config/executiveScorecards';

describe('getMetricStatus', () => {
  describe('higher is better (default)', () => {
    const metric: ScorecardMetric = {
      id: 'harvestRate',
      name: 'Harvest Compliance',
      targetValue: 95,
      warningThreshold: 85,
      criticalThreshold: 75,
      higherIsBetter: true,
    };

    it('returns green when value meets or exceeds target', () => {
      expect(getMetricStatus(95, metric)).toBe('green');
      expect(getMetricStatus(100, metric)).toBe('green');
      expect(getMetricStatus(99.5, metric)).toBe('green');
    });

    it('returns amber when value is between warning and target', () => {
      expect(getMetricStatus(94, metric)).toBe('amber');
      expect(getMetricStatus(90, metric)).toBe('amber');
      expect(getMetricStatus(85, metric)).toBe('amber'); // exactly at warning threshold
    });

    it('returns red when value is below warning threshold', () => {
      expect(getMetricStatus(84, metric)).toBe('red');
      expect(getMetricStatus(75, metric)).toBe('red');
      expect(getMetricStatus(50, metric)).toBe('red');
      expect(getMetricStatus(0, metric)).toBe('red');
    });
  });

  describe('lower is better', () => {
    const metric: ScorecardMetric = {
      id: 'arAging',
      name: 'AR > 90 Days',
      targetValue: 50000,
      warningThreshold: 100000,
      criticalThreshold: 200000,
      higherIsBetter: false,
    };

    it('returns green when value meets or is below target', () => {
      expect(getMetricStatus(50000, metric)).toBe('green');
      expect(getMetricStatus(25000, metric)).toBe('green');
      expect(getMetricStatus(0, metric)).toBe('green');
    });

    it('returns amber when value is between target and warning', () => {
      expect(getMetricStatus(75000, metric)).toBe('amber');
      expect(getMetricStatus(99999, metric)).toBe('amber');
      expect(getMetricStatus(100000, metric)).toBe('amber'); // exactly at warning threshold
    });

    it('returns red when value exceeds warning threshold', () => {
      expect(getMetricStatus(100001, metric)).toBe('red');
      expect(getMetricStatus(150000, metric)).toBe('red');
      expect(getMetricStatus(500000, metric)).toBe('red');
    });
  });

  describe('lower is better - open positions example', () => {
    const metric: ScorecardMetric = {
      id: 'openPositions',
      name: 'Open Positions',
      targetValue: 0,
      warningThreshold: 3,
      criticalThreshold: 5,
      higherIsBetter: false,
    };

    it('returns green when no open positions', () => {
      expect(getMetricStatus(0, metric)).toBe('green');
    });

    it('returns amber when 1-3 open positions', () => {
      expect(getMetricStatus(1, metric)).toBe('amber');
      expect(getMetricStatus(2, metric)).toBe('amber');
      expect(getMetricStatus(3, metric)).toBe('amber');
    });

    it('returns red when more than 3 open positions', () => {
      expect(getMetricStatus(4, metric)).toBe('red');
      expect(getMetricStatus(5, metric)).toBe('red');
      expect(getMetricStatus(10, metric)).toBe('red');
    });
  });

  describe('edge cases', () => {
    const metric: ScorecardMetric = {
      id: 'test',
      name: 'Test Metric',
      targetValue: 95,
      warningThreshold: 85,
      criticalThreshold: 75,
      higherIsBetter: true,
    };

    it('returns gray for undefined value', () => {
      expect(getMetricStatus(undefined, metric)).toBe('gray');
    });

    it('returns gray when thresholds are missing', () => {
      const metricNoThresholds: ScorecardMetric = {
        id: 'noThresholds',
        name: 'No Thresholds',
      };
      expect(getMetricStatus(50, metricNoThresholds)).toBe('gray');
    });

    it('returns gray when target is missing', () => {
      const metricNoTarget: ScorecardMetric = {
        id: 'noTarget',
        name: 'No Target',
        warningThreshold: 85,
        criticalThreshold: 75,
      };
      expect(getMetricStatus(90, metricNoTarget)).toBe('gray');
    });

    it('handles exactly at threshold boundaries correctly', () => {
      // Exactly at target - should be green
      expect(getMetricStatus(95, metric)).toBe('green');
      // Exactly at warning - should be amber (still meets warning)
      expect(getMetricStatus(85, metric)).toBe('amber');
    });

    it('handles negative values', () => {
      // For higherIsBetter, negative is definitely red
      expect(getMetricStatus(-10, metric)).toBe('red');
    });
  });

  describe('real-world metrics from config', () => {
    it('Harvest Compliance: 92% should be amber (target 95%, warning 85%)', () => {
      const harvestMetric: ScorecardMetric = {
        id: 'harvestRate',
        name: 'Harvest Compliance',
        targetValue: 95,
        warningThreshold: 85,
        criticalThreshold: 75,
        higherIsBetter: true,
      };
      expect(getMetricStatus(92, harvestMetric)).toBe('amber');
    });

    it('AR Aging: $85K should be amber (target $50K, warning $100K)', () => {
      const arMetric: ScorecardMetric = {
        id: 'arAging',
        name: 'AR > 90 Days',
        targetValue: 50000,
        warningThreshold: 100000,
        criticalThreshold: 200000,
        higherIsBetter: false,
      };
      expect(getMetricStatus(85000, arMetric)).toBe('amber');
    });

    it('Open Positions: 2 should be amber (target 0, warning 3)', () => {
      const positionsMetric: ScorecardMetric = {
        id: 'openPositions',
        name: 'Open Positions',
        targetValue: 0,
        warningThreshold: 3,
        criticalThreshold: 5,
        higherIsBetter: false,
      };
      expect(getMetricStatus(2, positionsMetric)).toBe('amber');
    });

    it('DSO: 52 days should be amber (target 45, warning 60)', () => {
      const dsoMetric: ScorecardMetric = {
        id: 'dso',
        name: 'Days Sales Outstanding',
        targetValue: 45,
        warningThreshold: 60,
        criticalThreshold: 75,
        higherIsBetter: false,
      };
      expect(getMetricStatus(52, dsoMetric)).toBe('amber');
    });
  });
});
