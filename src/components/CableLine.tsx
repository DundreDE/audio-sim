import React from 'react';

interface Point {
    x: number;
    y: number;
}

interface CableLineProps {
    start: Point;
    end: Point;
    color?: string;
    onClick?: () => void;
    isDraft?: boolean; // If true, follows mouse
}

export const CableLine: React.FC<CableLineProps> = ({
    start,
    end,
    color = 'black',
    onClick,
    isDraft = false,
}) => {
    // Bezier curve calculation
    const dx = Math.abs(end.x - start.x);
    // const dy = Math.abs(end.y - start.y);

    // Curvature control points
    // Simple heuristic: curviness depends on distance
    const curvature = Math.min(dx * 0.5, 150) + 50;

    // If start is roughly left of end, standard S-curve.
    // But ports are side-specific.
    // Assuming inputs left, outputs right.
    // Output -> Input means Right -> Left flow usually.

    const cp1 = { x: start.x + curvature, y: start.y };
    const cp2 = { x: end.x - curvature, y: end.y };

    const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

    return (
        <g className="pointer-events-stroke group cursor-pointer" onClick={onClick}>
            {/* Thick transparent path for easier clicking */}
            <path
                d={pathData}
                stroke="transparent"
                strokeWidth="15"
                fill="none"
            />
            {/* Visible cable */}
            <path
                d={pathData}
                stroke={color}
                strokeWidth="4"
                fill="none"
                className={`transition-colors ${isDraft ? 'opacity-70' : ''} group-hover:stroke-blue-500`}
                strokeLinecap="round"
                style={{ pointerEvents: 'none' }}
            />
        </g>
    );
};
