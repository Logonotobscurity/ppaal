import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * @component ActivityAuditTrail
 * @description Chronological audit trail of all PAL actions and decisions
 * @pattern Audit Pattern
 */

interface AuditEntry {
  id: string;
  timestamp: string;
  type: 'voice_input' | 'meaning_parsed' | 'gs_evaluated' | 'action_staged' | 'approval_granted' | 'approval_rejected' | 'action_executed' | 'error';
  actor: 'user' | 'system' | 'cme' | 'gs_gate' | 'approver' | 'executor';
  description: string;
  metadata?: Record<string, unknown>;
  workspaceId: string;
}

interface ActivityAuditTrailProps {
  entries?: AuditEntry[];
  limit?: number;
}

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: 'audit_010',
    timestamp: '2026-02-13T15:42:00Z',
    type: 'action_executed',
    actor: 'executor',
    description: 'Payment reminder sent to Mama Nkechi via WhatsApp',
    metadata: {
      action_id: 'act_789',
      channel: 'whatsapp',
      recipient: 'Mama Nkechi',
      amount: 50000,
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_009',
    timestamp: '2026-02-13T15:41:55Z',
    type: 'approval_granted',
    actor: 'approver',
    description: 'Auto-approved: Gs score 1.8 below threshold',
    metadata: {
      approval_id: 'appr_456',
      gs_score: 1.8,
      auto_approved: true,
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_008',
    timestamp: '2026-02-13T15:41:50Z',
    type: 'gs_evaluated',
    actor: 'gs_gate',
    description: 'Risk assessment completed for payment reminder workflow',
    metadata: {
      gs_score: 1.8,
      breakdown: { g_neg: 0.0, g_amt: 1.2, g_ch: 0.3, g_drift: 0.2, g_health: 0.1 },
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_007',
    timestamp: '2026-02-13T15:41:45Z',
    type: 'meaning_parsed',
    actor: 'cme',
    description: 'Entities extracted: 1 customer, 1 amount, 1 commitment',
    metadata: {
      entities: [
        { type: 'customer', value: 'Mama Nkechi' },
        { type: 'amount', value: 50000 },
        { type: 'commitment', value: 'send friday' },
      ],
      mode: 'do',
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_006',
    timestamp: '2026-02-13T15:41:40Z',
    type: 'voice_input',
    actor: 'user',
    description: 'Voice transcript received: "Send 50k to Mama Nkechi every friday"',
    metadata: {
      session_id: 'sess_123',
      duration_ms: 2340,
      language: 'pcm+en',
      codeswitch: true,
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_005',
    timestamp: '2026-02-13T14:23:15Z',
    type: 'approval_rejected',
    actor: 'approver',
    description: 'Manual rejection: User declined high-risk transfer',
    metadata: {
      approval_id: 'appr_455',
      gs_score: 5.2,
      reason: 'User confirmed cancellation',
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_004',
    timestamp: '2026-02-13T14:23:10Z',
    type: 'gs_evaluated',
    actor: 'gs_gate',
    description: 'High risk detected: Verbatim negation + large amount',
    metadata: {
      gs_score: 5.2,
      breakdown: { g_neg: 2.8, g_amt: 1.5, g_ch: 0.4, g_drift: 0.3, g_health: 0.2 },
      blocked_reason: 'verbatim_negation_detected',
    },
    workspaceId: 'ws_demo_123',
  },
  {
    id: 'audit_003',
    timestamp: '2026-02-13T11:45:30Z',
    type: 'error',
    actor: 'system',
    description: 'Execution timeout: Sahara API connection lost',
    metadata: {
      error_code: 'TIMEOUT',
      retry_count: 3,
      last_error: 'WebSocket closed unexpectedly',
    },
    workspaceId: 'ws_demo_123',
  },
];

export function ActivityAuditTrail({ entries = MOCK_ENTRIES, limit = 20 }: ActivityAuditTrailProps) {
  const getTypeColor = (type: AuditEntry['type']) => {
    switch (type) {
      case 'voice_input':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'meaning_parsed':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'gs_evaluated':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'action_staged':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approval_granted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'approval_rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'action_executed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'error':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActorIcon = (actor: AuditEntry['actor']) => {
    switch (actor) {
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      case 'cme':
        return '🧠';
      case 'gs_gate':
        return '🛡️';
      case 'approver':
        return '✅';
      case 'executor':
        return '⚡';
      default:
        return '•';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredEntries = entries.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Activity Audit Trail</h2>
          <p className="text-sm text-gray-600">Complete chronological record of all system actions</p>
        </div>
        <Badge variant="outline" className="bg-gray-100 text-gray-700">
          {entries.length} entries
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

        {/* Entries */}
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="relative pl-16 py-4 group">
            {/* Dot on Timeline */}
            <div className={`absolute left-5 w-3 h-3 rounded-full border-2 ${getTypeColor(entry.type).replace('bg-', 'border-').split(' ')[2]} bg-white z-10`} />

            {/* Card */}
            <Card className="border border-gray-200 hover:border-violet-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getActorIcon(entry.actor)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`text-xs ${getTypeColor(entry.type)}`}>
                        {entry.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500 font-mono">
                        {formatTime(entry.timestamp)}
                      </span>
                      <span className="text-xs text-gray-400">
                        by {entry.actor}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-charcoal mb-2">
                      {entry.description}
                    </p>

                    {/* Metadata (if any) */}
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <details className="text-xs">
                        <summary className="text-violet-600 cursor-pointer hover:text-violet-800">
                          View details ({Object.keys(entry.metadata).length} fields)
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded border text-xs overflow-x-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Load More */}
      {entries.length > limit && (
        <div className="text-center pt-4">
          <button className="text-sm text-violet-600 hover:text-violet-800 font-medium">
            Load more entries ({entries.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
