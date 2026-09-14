import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Entity } from '@/lib/meaning-engine/entity-extractor';

/**
 * @component MeaningPanel
 * @description Displays extracted entities as interactive chips
 * @pattern Component Pattern (Presentational)
 */
interface MeaningPanelProps {
  entities: Entity[];
  onEntityClick?: (entity: Entity) => void;
}

export function MeaningPanel({ entities, onEntityClick }: MeaningPanelProps) {
  const getEntityColor = (type: Entity['type']): string => {
    switch (type) {
      case 'customer':
        return 'bg-violet-100 text-violet-700 border-violet-500/30 hover:bg-violet-200';
      case 'amount':
        return 'bg-teal-100 text-teal-700 border-teal-500/30 hover:bg-teal-200';
      case 'date':
        return 'bg-amber-100 text-amber-700 border-amber-500/30 hover:bg-amber-200';
      case 'item':
        return 'bg-charcoal-50 text-charcoal-700 border-charcoal-500/30 hover:bg-charcoal-100';
      case 'commitment':
        return 'bg-violet-100 text-violet-700 border-violet-500/30 hover:bg-violet-200';
      case 'constraint':
        return 'bg-red-100 text-red-700 border-red-500/30 hover:bg-red-200';
      default:
        return 'bg-charcoal-50 text-charcoal-700 border-charcoal-500/30';
    }
  };

  const getModeIcon = (mode: Entity['mode']): string => {
    switch (mode) {
      case 'ask':
        return '🔍';
      case 'learn':
        return '🧠';
      case 'do':
        return '⚡';
    }
  };

  if (entities.length === 0) {
    return (
      <Card className="border-2 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Meaning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] flex items-center justify-center bg-ivory/50 rounded-xl border border-charcoal/10">
            <p className="text-charcoal/40 italic">No entities extracted yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Meaning</CardTitle>
          <Badge variant="outline" className="bg-charcoal-50 text-charcoal-700">
            {entities.length} entit{entities.length === 1 ? 'y' : 'ies'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[120px]">
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <Button
                key={entity.id}
                variant="outline"
                size="sm"
                onClick={() => onEntityClick?.(entity)}
                className={`rounded-full border ${getEntityColor(entity.type)} transition-colors`}
              >
                <span className="mr-1">{getModeIcon(entity.mode)}</span>
                <span className="font-medium capitalize">{entity.type}:</span>
                <span className="ml-1">{String(entity.value)}</span>
                {entity.confidence < 0.7 && (
                  <span className="ml-1 text-xs opacity-60">?</span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default MeaningPanel;
