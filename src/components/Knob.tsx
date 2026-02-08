import React, { useState, useCallback, useEffect } from 'react';

interface KnobProps {
    value: number; // 0 to 100 or specific range
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    size?: number;
}

export const Knob: React.FC<KnobProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    label,
    size = 40,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(0);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            setIsDragging(true);
            setStartY(e.clientY);
            setStartValue(value);
            e.preventDefault();
            e.stopPropagation();
        },
        [value]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                const deltaY = startY - e.clientY;
                const range = max - min;
                const step = range / 200; // Sensitivity
                let newValue = startValue + deltaY * step;
                newValue = Math.max(min, Math.min(max, newValue));
                onChange(newValue);
            }
        },
        [isDragging, startY, startValue, min, max, onChange]
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

    // Visual calculation
    const percentage = (value - min) / (max - min);
    const rotation = -135 + percentage * 270; // -135 to +135 degrees

    return (
        <div className="flex flex-col items-center select-none bg-gray-600 rounded p-1">
            <div
                className="relative rounded-full bg-gray-200 border-2 border-gray-400 cursor-ns-resize"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
            >
                <div
                    className="absolute w-1 h-1/2 bg-red-500 origin-bottom left-1/2 bottom-1/2 -ml-0.5 rounded-t"
                    style={{ transform: `rotate(${rotation}deg)` }}
                />
            </div>
            {label && <span className="text-[10px] text-white font-mono mt-1 w-full text-center truncate">{label}</span>}
            <span className="text-[8px] text-gray-300 font-mono">{Math.round(value)}</span>
        </div>
    );
};
