'use client';

import React, { useState } from 'react';
import { useSavedViews, SavedView } from '@/hooks/use-saved-views';
import { useCustomerFilters } from '@/hooks/use-customer-filters';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SortableItemProps {
  view: SavedView;
  isSelected: boolean;
  onSelect: (view: SavedView) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ view, isSelected, onSelect, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: view.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between group rounded-[6px] px-2 py-1.5 transition-colors text-[14px]",
        isSelected ? "bg-[var(--accent)] text-[var(--primary)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]",
        isDragging && "opacity-50 z-10 relative"
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="cursor-grab opacity-0 group-hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-quaternary)] transition-opacity flex items-center"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${view.name}`}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <button
          className="flex-1 text-left truncate py-0.5 outline-none"
          onClick={() => onSelect(view)}
        >
          {view.name}
        </button>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isSelected && <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />}
        {!view.isPredefined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(view.id);
            }}
            className="p-1 text-[var(--text-quaternary)] opacity-0 group-hover:opacity-100 hover:text-[var(--destructive)] transition-opacity"
            aria-label={`Delete ${view.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SavedViewsList() {
  const { views, selectedViewId, saveCurrentAsView, deleteView, reorderViews } = useSavedViews();
  const { setFilters } = useCustomerFilters();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = views.findIndex((v) => v.id === active.id);
      const newIndex = views.findIndex((v) => v.id === over.id);
      reorderViews(oldIndex, newIndex);
    }
  };

  const handleSelectView = (view: SavedView) => {
    const payload = typeof view.filters === 'function' ? view.filters() : view.filters;
    // Set filters clears pagination automatically due to Phase 4
    setFilters(payload);
  };

  const handleSaveView = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      saveCurrentAsView(newViewName);
      setIsDialogOpen(false);
      setNewViewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save view');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-quaternary)]">
          Saved Views
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) {
            setNewViewName('');
            setError('');
          }
        }}>
          <DialogTrigger asChild>
            <button
              className="text-[var(--primary)] hover:bg-[var(--accent)] p-1 rounded transition-colors"
              aria-label="Save current view"
              title="Save current filters as view"
            >
              <Plus className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSaveView}>
              <DialogHeader>
                <DialogTitle>Save Current View</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Input
                    id="name"
                    value={newViewName}
                    onChange={(e) => {
                      setNewViewName(e.target.value);
                      setError('');
                    }}
                    placeholder="E.g., High Value Prospects"
                    className="col-span-3"
                    autoFocus
                  />
                  {error && <span className="text-[12px] text-destructive">{error}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save View</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-2 space-y-0.5 pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={views.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            {views.map((view) => (
              <SortableItem
                key={view.id}
                view={view}
                isSelected={view.id === selectedViewId}
                onSelect={handleSelectView}
                onDelete={deleteView}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
