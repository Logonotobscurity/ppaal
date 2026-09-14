import { Card, CardContent } from '@/components/ui/card';

/**
 * @component MobileWorkflowCard
 * @description Compact workflow card optimized for mobile screens
 * @pattern Component Pattern (Mobile-first)
 */
interface MobileWorkflowCardProps {
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  amount?: string;
  recipient?: string;
  riskScore?: number;
  onClick?: () => void;
}

export function MobileWorkflowCard({
  title,
  status,
  amount,
  recipient,
  riskScore,
  onClick,
}: MobileWorkflowCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'border-amber-500/30 bg-amber-50';
      case 'approved':
      case 'completed':
        return 'border-teal-500/30 bg-teal-50';
      case 'rejected':
        return 'border-red-500/30 bg-red-50';
      default:
        return 'border-charcoal-500/30 bg-charcoal-50';
    }
  };

  const getRiskIndicator = () => {
    if (!riskScore) return null;
    if (riskScore >= 7.0) return '🔴';
    if (riskScore >= 5.0) return '🟠';
    if (riskScore >= 3.0) return '🟡';
    return '🟢';
  };

  return (
    <Card
      className={`border-2 rounded-2xl shadow-sm ${getStatusColor()} transition-all active:scale-[0.98]`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-charcoal">{title}</h3>
          {getRiskIndicator()}
        </div>

        {recipient && (
          <p className="text-sm text-charcoal/70 mb-1">To: {recipient}</p>
        )}

        {amount && (
          <p className="text-lg font-bold text-charcoal mb-3">{amount}</p>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full capitalize ${
              status === 'pending'
                ? 'bg-amber-200 text-amber-800'
                : status === 'approved' || status === 'completed'
                  ? 'bg-teal-200 text-teal-800'
                  : 'bg-red-200 text-red-800'
            }`}
          >
            {status}
          </span>

          {riskScore !== undefined && (
            <span className="text-xs text-charcoal/60">
              Risk: {riskScore.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MobileWorkflowCard;
