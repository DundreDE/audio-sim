import React, { useState, useCallback, useEffect } from 'react';

interface FaderProps {
    value: number; // 0 to 100
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    height?: number;
}

export const Fader: React.FC<FaderProps> = ({
    value,
    onChange,
    min = -70,
    max = 10,
    label,
    height = 150
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setStartValue(value);
        e.stopPropagation();
    }, [value]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const deltaY = startY - e.clientY;
            const range = max - min;
            const step = range / height;
            let newValue = startValue + deltaY * step;
            newValue = Math.max(min, Math.min(max, newValue));
            onChange(newValue);
        }
    }, [isDragging, startY, startValue, min, max, height, onChange]);

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

    const percentage = (value - min) / (max - min);
    // position from bottom
    const handlePos = percentage * (height - 20); // 20 is handle height

    return (
        <div className="flex flex-col items-center select-none bg-gray-800 p-1 rounded gap-1">
            {/* Track */}
            <div
                className="relative bg-black w-4 rounded-full border border-gray-600"
                style={{ height }}
            >
                {/* Handle */}
                <div
                    className="absolute left-0 w-full h-5 bg-gray-300 border-2 border-gray-400 rounded cursor-pointer hover:bg-white active:bg-blue-200 shadow-md"
                    style={{ bottom: handlePos }}
                    onMouseDown={handleMouseDown}
                />
            </div>
            {label && <span className="text-[10px] text-white font-mono">{label}</span>}
            <span className="text-[8px] text-gray-400 font-mono w-6 text-center">{Math.round(value)}dB</span>
        </div>
    );
};
