import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * @component FailureReplay
 * @description Replay and analyze failed workflow executions
 * @pattern Debug Pattern
 */

interface WorkflowFailure {
  id: string;
  timestamp: string;
  transcript: string;
  gsScore: number;
  gsBreakdown: Record<string, number>;
  failureReason: 'gs_blocked' | 'approval_rejected' | 'execution_error' | 'timeout';
  entities: Array<{ type: string; value: string | number }>;
  attemptedAction: string;
  workspaceId: string;
}

interface FailureReplayProps {
  failures?: WorkflowFailure[];
  onRetry?: (failureId: string) => void;
}

const MOCK_FAILURES: WorkflowFailure[] = [
  {
    id: 'fail_001',
    timestamp: '2026-02-13T14:23:00Z',
    transcript: "Send 500k to Mama Nkechi but wait o, I need confirm first",
    gsScore: 5.2,
    gsBreakdown: {
      g_neg: 2.8,
      g_amt: 1.5,
      g_ch: 0.0,
      g_drift: 0.4,
      g_health: 0.5,
    },
    failureReason: 'gs_blocked',
    entities: [
      { type: 'amount', value: 500000 },
      { type: 'customer', value: 'Mama Nkechi' },
      { type: 'constraint', value: 'wait, need confirm' },
    ],
    attemptedAction: 'TRANSFER_PAYMENT',
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'fail_002',
    timestamp: '2026-02-13T11:45:00Z',
    transcript: "No send am today, make we talk tomorrow",
    gsScore: 7.1,
    gsBreakdown: {
      g_neg: 4.2,
      g_amt: 0.0,
      g_ch: 0.9,
      g_drift: 1.0,
      g_health: 1.0,
    },
    failureReason: 'gs_blocked',
    entities: [
      { type: 'constraint', value: 'no send' },
      { type: 'date', value: 'tomorrow' },
    ],
    attemptedAction: 'SEND_REMINDER',
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'fail_003',
    timestamp: '2026-02-12T16:30:00Z',
    transcript: "Collect 85k from Emeka every friday small small",
    gsScore: 2.1,
    gsBreakdown: {
      g_neg: 0.0,
      g_amt: 1.2,
      g_ch: 0.0,
      g_drift: 0.4,
      g_health: 0.5,
    },
    failureReason: 'approval_rejected',
    entities: [
      { type: 'amount', value: 85000 },
      { type: 'customer', value: 'Emeka' },
      { type: 'commitment', value: 'every friday' },
      { type: 'constraint', value: 'small small (batch mode)' },
    ],
    attemptedAction: 'CREATE_COLLECTION_PLAN',
    workspaceId: 'ws_demo_123',
  },
];

export function FailureReplay({ failures = MOCK_FAILURES, onRetry }: FailureReplayProps) {
  const [selectedFailure, setSelectedFailure] = useState<WorkflowFailure | null>(null);

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'gs_blocked':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'approval_rejected':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'execution_error':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'timeout':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'gs_blocked':
        return 'Gs Gate Blocked';
      case 'approval_rejected':
        return 'Approval Rejected';
      case 'execution_error':
        return 'Execution Error';
      case 'timeout':
        return 'Timeout';
      default:
        return reason;
    }
  };

  const formatGsBreakdown = (breakdown: Record<string, number>) => {
    return Object.entries(breakdown)
      .map(([key, value]) => `${key}: ${value.toFixed(1)}`)
      .join(' + ');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Failure Replay</h2>
          <p className="text-sm text-gray-600">Analyze and learn from blocked workflows</p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700">
          {failures.length} Failures
        </Badge>
      </div>

      {/* Failures List */}
      <div className="grid gap-4">
        {failures.map((failure) => (
          <Card
            key={failure.id}
            className={`border cursor-pointer transition-all hover:shadow-md ${
              selectedFailure?.id === failure.id ? 'border-violet-400 ring-2 ring-violet-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedFailure(failure)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Top Row */}
                  <div className="flex items-center gap-3">
                    <Badge className={getReasonBadgeColor(failure.failureReason)}>
                      {getReasonLabel(failure.failureReason)}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatDate(failure.timestamp)}</span>
                  </div>

                  {/* Transcript */}
                  <p className="text-sm text-charcoal font-medium italic">
                    "{failure.transcript}"
                  </p>

                  {/* Gs Score */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-semibold ${failure.gsScore >= 5.0 ? 'text-red-600' : 'text-amber-600'}`}>
                      Gs Score: {failure.gsScore.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({formatGsBreakdown(failure.gsBreakdown)})
                    </span>
                  </div>

                  {/* Entities Preview */}
                  <div className="flex flex-wrap gap-2">
                    {failure.entities.slice(0, 3).map((entity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {entity.type}: {String(entity.value).slice(0, 20)}
                      </Badge>
                    ))}
                    {failure.entities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{failure.entities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry?.(failure.id);
                    }}
                    className="text-violet-600 border-violet-300 hover:bg-violet-50"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedFailure && (
        <Card className="border-violet-300 bg-violet-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Failure Details: {selectedFailure.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Transcript */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcript</h4>
              <p className="text-sm bg-white p-3 rounded border">{selectedFailure.transcript}</p>
            </div>

            {/* Gs Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Gs Score Breakdown</h4>
              <div className="bg-white p-3 rounded border space-y-2">
                <div className="flex justify-between text-sm">
                  <span>g_neg (negation):</span>
                  <span className="font-mono">{selectedFailure.gsBreakdown.g_neg?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>g_amt (amount):</span>
                  <span className="font-mono">{selectedFailure.gsBreakdown.g_amt?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>g_ch (channel):</span>
                  <span className="font-mono">{selectedFailure.gsBreakdown.g_ch?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>g_drift (drift):</span>
                  <span className="font-mono">{selectedFailure.gsBreakdown.g_drift?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>g_health (health):</span>
                  <span className="font-mono">{selectedFailure.gsBreakdown.g_health?.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className={`font-mono ${selectedFailure.gsScore >= 5.0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {selectedFailure.gsScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* All Entities */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Extracted Entities</h4>
              <div className="bg-white p-3 rounded border space-y-2">
                {selectedFailure.entities.map((entity, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <Badge variant="secondary">{entity.type}</Badge>
                    <span className="font-mono">{String(entity.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attempted Action */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Attempted Action</h4>
              <Badge className="bg-violet-100 text-violet-800">
                {selectedFailure.attemptedAction}
              </Badge>
            </div>

            {/* Retry Button */}
            <div className="pt-4">
              <Button
                onClick={() => onRetry?.(selectedFailure.id)}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                Retry This Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
