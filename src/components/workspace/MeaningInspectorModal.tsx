import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Entity } from '@/lib/meaning-engine/entity-extractor';

/**
 * @component MeaningInspectorModal
 * @description Modal for viewing and editing entity details
 * @pattern Component Pattern (Modal)
 */
interface MeaningInspectorModalProps {
  entity: Entity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (entity: Entity) => void;
}

export function MeaningInspectorModal({
  entity,
  open,
  onOpenChange,
  onSave,
}: MeaningInspectorModalProps) {
  const [editedValue, setEditedValue] = useState<string>('');

  React.useEffect(() => {
    if (entity) {
      setEditedValue(String(entity.value));
    }
  }, [entity]);

  if (!entity) return null;

  const getModeColor = (mode: Entity['mode']): string => {
    switch (mode) {
      case 'ask':
        return 'bg-violet-100 text-violet-700 border-violet-500/30';
      case 'learn':
        return 'bg-teal-100 text-teal-700 border-teal-500/30';
      case 'do':
        return 'bg-amber-100 text-amber-700 border-amber-500/30';
    }
  };

  const handleSave = () => {
    const updatedEntity: Entity = {
      ...entity,
      value: editedValue,
    };
    onSave?.(updatedEntity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">
              {entity.type === 'customer' && '👤'}
              {entity.type === 'amount' && '💰'}
              {entity.type === 'date' && '📅'}
              {entity.type === 'item' && '📦'}
              {entity.type === 'commitment' && '🤝'}
              {entity.type === 'constraint' && '⚠️'}
            </span>
            Entity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type & Mode */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {entity.type}
            </Badge>
            <Badge variant="outline" className={getModeColor(entity.mode)}>
              {entity.mode.toUpperCase()}
            </Badge>
            <span className="text-sm text-charcoal/60">
              Confidence: {(entity.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Value Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal">Value</label>
            <input
              type="text"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-charcoal/20 bg-ivory text-charcoal focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          {/* Evidence Timeline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal">Evidence</label>
            <div className="p-3 rounded-lg bg-charcoal/5 text-sm text-charcoal/70">
              <div>Start: {entity.evidence.start_ms}ms</div>
              <div>End: {entity.evidence.end_ms}ms</div>
              <div>Duration: {entity.evidence.end_ms - entity.evidence.start_ms}ms</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MeaningInspectorModal;
