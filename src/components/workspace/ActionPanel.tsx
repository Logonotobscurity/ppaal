import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WorkflowNode } from '@/types/workflow';

/**
 * @component ActionPanel
 * @description Displays workflow nodes as actionable cards
 * @pattern Component Pattern (Presentational)
 */
interface ActionPanelProps {
  nodes: WorkflowNode[];
  onNodeExecute?: (nodeId: string) => void;
  onNodeApprove?: (nodeId: string) => void;
  onNodeReject?: (nodeId: string) => void;
}

export function ActionPanel({
  nodes,
  onNodeExecute,
  onNodeApprove,
  onNodeReject,
}: ActionPanelProps) {
  const getStatusColor = (status: WorkflowNode['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-500/30';
      case 'awaiting_approval':
        return 'bg-violet-100 text-violet-700 border-violet-500/30';
      case 'approved':
        return 'bg-teal-100 text-teal-700 border-teal-500/30';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-500/30';
      case 'executing':
        return 'bg-charcoal-100 text-charcoal-700 border-charcoal-500/30 animate-pulse';
      case 'completed':
        return 'bg-teal-100 text-teal-700 border-teal-500/30';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-500/30';
      default:
        return 'bg-charcoal-50 text-charcoal-700 border-charcoal-500/30';
    }
  };

  const getActionTypeIcon = (type: WorkflowNode['action_type']): string => {
    switch (type) {
      case 'send_payment':
        return '💸';
      case 'send_message':
        return '💬';
      case 'create_invoice':
        return '📄';
      case 'schedule_reminder':
        return '⏰';
      case 'update_record':
        return '✏️';
      default:
        return '⚡';
    }
  };

  if (nodes.length === 0) {
    return (
      <Card className="border-2 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-ivory/50 rounded-xl border border-charcoal/10">
            <p className="text-charcoal/40 italic">No actions pending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Actions</CardTitle>
          <Badge variant="outline" className="bg-charcoal-50 text-charcoal-700">
            {nodes.filter((n) => n.status === 'pending' || n.status === 'awaiting_approval').length}{' '}
            pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-3">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-xl border-2 ${getStatusColor(node.status)} transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getActionTypeIcon(node.action_type)}</span>
                    <div>
                      <h4 className="font-semibold text-sm capitalize">
                        {node.action_type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs opacity-70 mt-0.5">{node.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {node.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Risk Score Indicator */}
                {node.gs_score !== null && node.gs_score >= 3.0 && (
                  <div className="mb-3 text-xs">
                    <span className="opacity-70">Risk Score: </span>
                    <span
                      className={`font-bold ${
                        node.gs_score >= 7.0
                          ? 'text-red-700'
                          : node.gs_score >= 5.0
                            ? 'text-amber-700'
                            : 'text-violet-700'
                      }`}
                    >
                      {node.gs_score.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  {node.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => onNodeExecute?.(node.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Execute
                    </Button>
                  )}
                  {node.status === 'awaiting_approval' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onNodeApprove?.(node.id)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNodeReject?.(node.id)}
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        ✗ Reject
                      </Button>
                    </>
                  )}
                  {node.status === 'executing' && (
                    <Button size="sm" disabled className="bg-charcoal-300 text-charcoal-600">
                      Executing...
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActionPanel;
