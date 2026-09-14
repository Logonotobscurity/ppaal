import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * @component BenchmarkDashboard
 * @description Intelligence screen showing workflow performance metrics
 * @pattern Dashboard Pattern
 */

interface BenchmarkMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'speed' | 'accuracy' | 'approval' | 'health';
}

interface BenchmarkDashboardProps {
  workspaceId?: string;
  period?: '7d' | '30d' | '90d';
}

const MOCK_METRICS: BenchmarkMetric[] = [
  {
    id: 'avg_response_time',
    label: 'Avg Response Time',
    value: 2.3,
    target: 3.0,
    unit: 'seconds',
    trend: 'up',
    category: 'speed',
  },
  {
    id: 'entity_accuracy',
    label: 'Entity Extraction Accuracy',
    value: 94.2,
    target: 90.0,
    unit: '%',
    trend: 'up',
    category: 'accuracy',
  },
  {
    id: 'auto_approval_rate',
    label: 'Auto-Approval Rate',
    value: 67.8,
    target: 70.0,
    unit: '%',
    trend: 'stable',
    category: 'approval',
  },
  {
    id: 'gs_score_avg',
    label: 'Avg Gs Risk Score',
    value: 1.8,
    target: 2.5,
    unit: 'score',
    trend: 'down',
    category: 'health',
  },
  {
    id: 'workflow_completion',
    label: 'Workflow Completion Rate',
    value: 89.5,
    target: 85.0,
    unit: '%',
    trend: 'up',
    category: 'accuracy',
  },
  {
    id: 'quiet_hours_compliance',
    label: 'Quiet Hours Compliance',
    value: 100,
    target: 100,
    unit: '%',
    trend: 'stable',
    category: 'health',
  },
];

export function BenchmarkDashboard({ workspaceId, period = '30d' }: BenchmarkDashboardProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isHigherBetter: boolean) => {
    if (trend === 'stable') return 'text-gray-500';
    const isGood = (trend === 'up' && isHigherBetter) || (trend === 'down' && !isHigherBetter);
    return isGood ? 'text-teal-600' : 'text-red-600';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'speed':
        return 'bg-violet-100 text-violet-800';
      case 'accuracy':
        return 'bg-teal-100 text-teal-800';
      case 'approval':
        return 'bg-amber-100 text-amber-800';
      case 'health':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progressValue = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Performance Benchmarks</h2>
          <p className="text-sm text-gray-600">Last {period.replace('d', ' days')}</p>
        </div>
        <Badge variant="outline" className="bg-violet-50 text-violet-700">
          Workspace: {workspaceId?.slice(0, 8) || 'demo'}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_METRICS.map((metric) => {
          const isHigherBetter = metric.unit === '%' || metric.id.includes('completion') || metric.id.includes('accuracy');
          const isExceedingTarget = isHigherBetter ? metric.value >= metric.target : metric.value <= metric.target;
          
          return (
            <Card key={metric.id} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </CardTitle>
                  <Badge className={`text-xs ${getCategoryColor(metric.category)}`}>
                    {metric.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Value Display */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-charcoal">
                      {metric.value.toFixed(1)}
                    </span>
                    <span className={`text-lg font-semibold ${getTrendColor(metric.trend, isHigherBetter)}`}>
                      {getTrendIcon(metric.trend)}
                    </span>
                  </div>

                  {/* Unit and Target */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{metric.unit}</span>
                    <span className={`font-medium ${isExceedingTarget ? 'text-teal-600' : 'text-amber-600'}`}>
                      Target: {metric.target}{metric.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <Progress 
                    value={progressValue(metric.value, metric.target)} 
                    className="h-2"
                  />

                  {/* Status */}
                  <div className="text-xs text-gray-500">
                    {isExceedingTarget ? (
                      <span className="text-teal-600 font-medium">✓ Exceeding target</span>
                    ) : (
                      <span className="text-amber-600 font-medium">⚠ Below target</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-violet-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-lg">Overall Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">94.2%</div>
              <div className="text-xs text-gray-600 mt-1">Accuracy Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">2.3s</div>
              <div className="text-xs text-gray-600 mt-1">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">67.8%</div>
              <div className="text-xs text-gray-600 mt-1">Auto-Approval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1.8</div>
              <div className="text-xs text-gray-600 mt-1">Avg Risk Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
