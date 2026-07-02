'use client';

import { useRef, useState } from 'react';

interface Reorderable {
    id: string;
    order: number;
}

interface UseReorderableCollectionOptions<T extends Reorderable> {
    initialItems: T[];
    onReorder: (orderedIds: string[]) => Promise<void>;
}

export function useReorderableCollection<T extends Reorderable>({
    initialItems,
    onReorder,
}: UseReorderableCollectionOptions<T>) {
    const [items, setItems] = useState<T[]>(initialItems);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const snapshotRef = useRef<T[]>(initialItems);

    const handleDragStart = (id: string) => setDragId(id);

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragOverId(id);
    };

    const handleDrop = async (targetId: string) => {
        if (!dragId || dragId === targetId) return;
        const previous = items;
        const from = items.findIndex((i) => i.id === dragId);
        const to = items.findIndex((i) => i.id === targetId);
        const reordered = [...items];
        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        const withOrder = reordered.map((item, index) => ({ ...item, order: index }));
        setItems(withOrder);
        setDragId(null);
        setDragOverId(null);
        try {
            await onReorder(withOrder.map((i) => i.id));
        } catch (err) {
            console.error(err);
            setItems(previous);
            alert('Грешка при пренареждане');
        }
    };

    const handleDragEnd = () => {
        setDragId(null);
        setDragOverId(null);
    };

    const revert = async (confirmMessage: string) => {
        if (!window.confirm(confirmMessage)) return;
        const previous = items;
        const original = snapshotRef.current;
        setItems(original);
        try {
            await onReorder(original.map((i) => i.id));
        } catch (err) {
            console.error(err);
            setItems(previous);
            alert('Грешка при връщане на промените');
        }
    };

    return {
        items,
        setItems,
        dragId,
        dragOverId,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        revert,
        snapshotRef,
    };
}
