import { useState, useCallback, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

export const useDraggable = (
    initialPosition: Position,
    onDrag: (pos: Position) => void
) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            setIsDragging(true);
            setOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
            e.stopPropagation();
        },
        [position]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                const newPos = {
                    x: e.clientX - offset.x,
                    y: e.clientY - offset.y,
                };
                setPosition(newPos);
                onDrag(newPos);
            }
        },
        [isDragging, offset, onDrag]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        handleMouseDown,
        isDragging,
    };
};
