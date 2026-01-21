'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { CEOScorecard as CEOScorecardType, CEOScorecardWithAudit, AuditMetadata } from '@/types';
import { SourceTooltip } from '@/components/common/CodeTooltip';
import { ScorecardDetailModal } from './ScorecardDetailModal';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Truck,
  DollarSign,
  Wallet,
  Users,
  Flag,
  ExternalLink,
} from 'lucide-react';

interface CEOScorecardProps {
  scorecard: CEOScorecardType | CEOScorecardWithAudit;
  isLoading?: boolean;
}

type ScorecardCategory = 'pipelineHealth' | 'deliveryHealth' | 'margin' | 'cash' | 'staffingCapacity' | 'strategicInitiatives';

interface ModalState {
  isOpen: boolean;
  category: ScorecardCategory | null;
}

export function CEOScorecard({ scorecard, isLoading }: CEOScorecardProps) {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, category: null });

  // Check if we have audit data
  const hasAudit = 'audit' in scorecard;
  const auditData = hasAudit ? (scorecard as CEOScorecardWithAudit).audit : undefined;

  const handleCardClick = (category: ScorecardCategory) => {
    setModalState({ isOpen: true, category });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, category: null });
  };

  const getModalData = () => {
    if (!modalState.category) return null;

    const cardConfigs: Record<ScorecardCategory, {
      title: string;
      source: string;
      status: 'healthy' | 'warning' | 'critical';
      metrics: { label: string; value: string; change?: number; lowerIsBetter?: boolean }[];
    }> = {
      pipelineHealth: {
        title: 'Pipeline Health',
        source: 'BD Process',
        status: scorecard.pipelineHealth.status,
        metrics: [
          { label: 'Pipeline Value', value: formatCurrency(scorecard.pipelineHealth.pipelineValue), change: scorecard.pipelineHealth.pipelineValueChange },
          { label: 'Win Rate', value: `${scorecard.pipelineHealth.winRate}%`, change: scorecard.pipelineHealth.winRateChange },
        ],
      },
      deliveryHealth: {
        title: 'Delivery Health',
        source: 'SD Process',
        status: scorecard.deliveryHealth.status,
        metrics: [
          { label: 'On-Time Delivery', value: `${scorecard.deliveryHealth.onTimeDelivery}%`, change: scorecard.deliveryHealth.onTimeDeliveryChange },
          { label: 'Client Satisfaction', value: `${scorecard.deliveryHealth.clientSatisfaction}/5.0`, change: scorecard.deliveryHealth.clientSatisfactionChange },
        ],
      },
      margin: {
        title: 'Margin',
        source: 'CP Process',
        status: scorecard.margin.status,
        metrics: [
          { label: 'Contract Margin', value: `${scorecard.margin.contractMargin}%`, change: scorecard.margin.contractMarginChange },
        ],
      },
      cash: {
        title: 'Cash',
        source: 'CF, AR Processes',
        status: scorecard.cash.status,
        metrics: [
          { label: 'Cash Position', value: formatCurrency(scorecard.cash.cashPosition), change: scorecard.cash.cashPositionChange },
          { label: 'DSO', value: `${scorecard.cash.dso} days`, change: scorecard.cash.dsoChange, lowerIsBetter: true },
          { label: 'AR 90+', value: formatCurrency(scorecard.cash.ar90Plus), change: scorecard.cash.ar90PlusChange, lowerIsBetter: true },
        ],
      },
      staffingCapacity: {
        title: 'Staffing Capacity',
        source: 'ST Process',
        status: scorecard.staffingCapacity.status,
        metrics: [
          { label: 'Billable Utilization', value: `${scorecard.staffingCapacity.billableUtilization}%`, change: scorecard.staffingCapacity.billableUtilizationChange },
          { label: 'Open Positions', value: scorecard.staffingCapacity.openPositions.toString() },
        ],
      },
      strategicInitiatives: {
        title: 'Strategic Initiatives',
        source: 'F-SP Function',
        status: scorecard.strategicInitiatives.status,
        metrics: [
          { label: 'On Track', value: `${scorecard.strategicInitiatives.initiativesOnTrack} / ${scorecard.strategicInitiatives.initiativesTotal}` },
        ],
      },
    };

    return cardConfigs[modalState.category];
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  const modalData = getModalData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">CEO Scorecard</h2>
          <p className="text-sm text-gray-500">F-EOC6: Executive-level metrics dashboard</p>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {new Date(scorecard.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Scorecard Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Pipeline Health */}
        <ScorecardCard
          title="Pipeline Health"
          icon={Target}
          status={scorecard.pipelineHealth.status}
          metrics={[
            {
              label: 'Pipeline Value',
              value: formatCurrency(scorecard.pipelineHealth.pipelineValue),
              change: scorecard.pipelineHealth.pipelineValueChange,
            },
            {
              label: 'Win Rate',
              value: `${scorecard.pipelineHealth.winRate}%`,
              change: scorecard.pipelineHealth.winRateChange,
            },
          ]}
          source="BD Process"
          onClick={() => handleCardClick('pipelineHealth')}
        />

        {/* Delivery Health */}
        <ScorecardCard
          title="Delivery Health"
          icon={Truck}
          status={scorecard.deliveryHealth.status}
          metrics={[
            {
              label: 'On-Time Delivery',
              value: `${scorecard.deliveryHealth.onTimeDelivery}%`,
              change: scorecard.deliveryHealth.onTimeDeliveryChange,
            },
            {
              label: 'Client Satisfaction',
              value: `${scorecard.deliveryHealth.clientSatisfaction}/5.0`,
              change: scorecard.deliveryHealth.clientSatisfactionChange,
            },
          ]}
          source="SD Process"
          onClick={() => handleCardClick('deliveryHealth')}
        />

        {/* Margin */}
        <ScorecardCard
          title="Margin"
          icon={DollarSign}
          status={scorecard.margin.status}
          metrics={[
            {
              label: 'Contract Margin',
              value: `${scorecard.margin.contractMargin}%`,
              change: scorecard.margin.contractMarginChange,
            },
          ]}
          source="CP Process"
          onClick={() => handleCardClick('margin')}
        />

        {/* Cash */}
        <ScorecardCard
          title="Cash"
          icon={Wallet}
          status={scorecard.cash.status}
          metrics={[
            {
              label: 'Cash Position',
              value: formatCurrency(scorecard.cash.cashPosition),
              change: scorecard.cash.cashPositionChange,
            },
            {
              label: 'DSO',
              value: `${scorecard.cash.dso} days`,
              change: scorecard.cash.dsoChange,
              lowerIsBetter: true,
            },
            {
              label: 'AR 90+',
              value: formatCurrency(scorecard.cash.ar90Plus),
              change: scorecard.cash.ar90PlusChange,
              lowerIsBetter: true,
            },
          ]}
          source="CF, AR Processes"
          onClick={() => handleCardClick('cash')}
        />

        {/* Staffing Capacity */}
        <ScorecardCard
          title="Staffing Capacity"
          icon={Users}
          status={scorecard.staffingCapacity.status}
          metrics={[
            {
              label: 'Billable Utilization',
              value: `${scorecard.staffingCapacity.billableUtilization}%`,
              change: scorecard.staffingCapacity.billableUtilizationChange,
            },
            {
              label: 'Open Positions',
              value: scorecard.staffingCapacity.openPositions.toString(),
              change: scorecard.staffingCapacity.openPositionsChange,
              neutral: true,
            },
          ]}
          source="ST Process"
          onClick={() => handleCardClick('staffingCapacity')}
        />

        {/* Strategic Initiatives */}
        <ScorecardCard
          title="Strategic Initiatives"
          icon={Flag}
          status={scorecard.strategicInitiatives.status}
          metrics={[
            {
              label: 'On Track',
              value: `${scorecard.strategicInitiatives.initiativesOnTrack} / ${scorecard.strategicInitiatives.initiativesTotal}`,
              percentage: Math.round(
                (scorecard.strategicInitiatives.initiativesOnTrack /
                  scorecard.strategicInitiatives.initiativesTotal) *
                  100
              ),
            },
          ]}
          source="F-SP Function"
          onClick={() => handleCardClick('strategicInitiatives')}
        />
      </div>

      {/* Modal */}
      {modalData && (
        <ScorecardDetailModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          title={modalData.title}
          source={modalData.source}
          status={modalData.status}
          metrics={modalData.metrics}
          audit={auditData && modalState.category ? auditData[modalState.category] : undefined}
        />
      )}
    </div>
  );
}

interface ScorecardCardProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    label: string;
    value: string;
    change?: number;
    lowerIsBetter?: boolean;
    neutral?: boolean;
    percentage?: number;
  }[];
  source: string;
  onClick?: () => void;
}

function ScorecardCard({ title, icon: Icon, status, metrics, source, onClick }: ScorecardCardProps) {
  const statusColors = {
    healthy: 'border-green-200 bg-green-50 hover:bg-green-100',
    warning: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    critical: 'border-red-200 bg-red-50 hover:bg-red-100',
  };

  const statusDot = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 p-4 text-left transition-all cursor-pointer w-full',
        statusColors[status]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink size={14} className="text-gray-400" />
          <div className={cn('h-3 w-3 rounded-full', statusDot[status])} />
        </div>
      </div>

      <div className="space-y-2">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{metric.value}</span>
              {metric.change !== undefined && !metric.neutral && (
                <ChangeIndicator
                  change={metric.change}
                  lowerIsBetter={metric.lowerIsBetter}
                />
              )}
              {metric.percentage !== undefined && (
                <span className="text-sm text-gray-500">({metric.percentage}%)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-400">Source: <SourceTooltip source={source} /></span>
      </div>
    </button>
  );
}

function ChangeIndicator({
  change,
  lowerIsBetter = false,
}: {
  change: number;
  lowerIsBetter?: boolean;
}) {
  const isPositive = lowerIsBetter ? change < 0 : change > 0;
  const isNegative = lowerIsBetter ? change > 0 : change < 0;

  if (Math.abs(change) < 0.1) {
    return (
      <span className="flex items-center text-xs text-gray-400">
        <Minus size={12} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex items-center text-xs',
        isPositive && 'text-green-600',
        isNegative && 'text-red-600'
      )}
    >
      {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="ml-0.5">{Math.abs(change).toFixed(1)}%</span>
    </span>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}
