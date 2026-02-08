import React from 'react';
import type { Device } from '../types/audio';
import { Port } from './Port';
import { useDraggable } from '../hooks/useDraggable';
import { Knob } from './Knob';
import { Fader } from './Fader';
import { LevelMeter } from './LevelMeter';

interface DeviceNodeProps {
    device: Device;
    onMove: (id: string, x: number, y: number) => void;
    onPortMouseDown: (portId: string, e: React.MouseEvent) => void;
    onPortMouseUp: (portId: string) => void;
    connectedPorts: Set<string>;
    onStateChange: (id: string, key: string, value: number) => void;
    onLabelChange: (id: string, key: string, label: string) => void;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({
    device,
    onMove,
    onPortMouseDown,
    onPortMouseUp,
    connectedPorts,
    onStateChange,
    onLabelChange,
}) => {
    const onStateChangeWrapper = (id: string, key: string, value: number) => {
        onStateChange(id, key, value);
    };
    const { position, handleMouseDown, isDragging } = useDraggable(
        device.position,
        (pos) => onMove(device.id, pos.x, pos.y)
    );

    return (
        <div
            className={`absolute bg-white border-2 rounded shadow-md p-2 flex flex-col gap-2 select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab z-10'
                }`}
            style={{
                left: position.x,
                top: position.y,
                width: device.width || 200,
                minHeight: device.height || 100,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="font-bold text-center border-b pb-1 mb-1">{device.name}</div>

            <div className="flex justify-between h-full">
                {/* Inputs Left */}
                <div className="flex flex-col gap-2">
                    {Object.values(device.ports)
                        .filter(p => p.direction === 'INPUT')
                        .map(port => (
                            <Port
                                key={port.id}
                                port={port}
                                onMouseDown={onPortMouseDown}
                                onMouseUp={onPortMouseUp}
                                isConnected={connectedPorts.has(port.id)}
                            />
                        ))
                    }
                </div>

                {/* Controls (Mixer Only) */}
                {device.type === 'MIXER' && (
                    <div className="flex gap-2 mx-4 items-end">
                        {[1, 2, 3, 4].map(ch => (
                            <div key={ch} className="flex flex-col items-center gap-2">
                                <Knob
                                    value={device.state?.[`ch${ch}_gain`] ?? 0}
                                    onChange={(v) => onStateChangeWrapper(device.id, `ch${ch}_gain`, v)}
                                    label="Gain"
                                    size={30}
                                    min={0}
                                    max={60}
                                />
                                <div className="flex gap-1 h-[120px]">
                                    <Fader
                                        value={device.state?.[`ch${ch}_vol`] ?? -70}
                                        onChange={(v) => onStateChangeWrapper(device.id, `ch${ch}_vol`, v)}
                                        // label={`CH ${ch}`}
                                        height={120}
                                    />
                                    <LevelMeter
                                        level={device.state?.[`ch${ch}_level`] ?? -60}
                                        clipping={device.state?.[`ch${ch}_clip`] === 1}
                                        height={120}
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="w-10 text-[10px] text-center border rounded bg-gray-50"
                                    placeholder={`CH ${ch}`}
                                    value={device.labels?.[`ch${ch}`] || ''}
                                    onChange={(e) => onLabelChange(device.id, `ch${ch}`, e.target.value)}
                                    onClick={(e) => e.stopPropagation()} // Prevent drag
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Outputs Right */}
                <div className="flex flex-col gap-2 items-end">
                    {Object.values(device.ports)
                        .filter(p => p.direction === 'OUTPUT')
                        .map(port => (
                            <Port
                                key={port.id}
                                port={port}
                                onMouseDown={onPortMouseDown}
                                onMouseUp={onPortMouseUp}
                                isConnected={connectedPorts.has(port.id)}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};
