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

    // Touch handlers for mobile
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            setIsDragging(true);
            const touch = e.touches[0];
            setOffset({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y,
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

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (isDragging) {
                const touch = e.touches[0];
                const newPos = {
                    x: touch.clientX - offset.x,
                    y: touch.clientY - offset.y,
                };
                setPosition(newPos);
                onDrag(newPos);
                e.preventDefault(); // Prevent scrolling
            }
        },
        [isDragging, offset, onDrag]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return {
        position,
        handleMouseDown,
        handleTouchStart,
        isDragging,
    };
};
