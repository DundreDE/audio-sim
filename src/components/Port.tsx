import React from 'react';
import type { Port as PortType } from '../types/audio';

interface PortProps {
    port: PortType;
    onMouseDown: (portId: string, e: React.MouseEvent) => void;
    onMouseUp: (portId: string) => void;
    isConnected: boolean;
}

export const Port: React.FC<PortProps> = ({ port, onMouseDown, onMouseUp, isConnected }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMouseDown(port.id, e);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMouseUp(port.id);
    }

    return (
        <div
            className={`flex items-center gap-2 ${port.direction === 'OUTPUT' ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            <div
                className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-colors ${isConnected
                    ? 'bg-green-500 border-green-600'
                    : 'bg-gray-300 border-gray-500 hover:bg-blue-400'
                    }`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                title={port.type}
            />
            <span className="text-xs text-gray-600 font-medium">{port.name}</span>
        </div>
    );
};
