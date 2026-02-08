import React, { useState, useRef, useMemo } from 'react';
import { useAudioSimulation } from '../hooks/useAudioSimulation';
import { DeviceNode } from './DeviceNode';
import { CableLine } from './CableLine';
import { createMicrophone, createMixer, createAmplifier, createSpeaker, createCrossover } from '../constants/devices';
import type { Device } from '../types/audio';
import { CableToolbar } from './CableToolbar';
import { MiniGame } from './MiniGame';
import { useVerification } from '../hooks/useVerification';
import { DeleteToolbar } from './DeleteToolbar';

// Helper to calculate estimated port position
const getPortPosition = (device: Device, portId: string): { x: number; y: number } | null => {
    // This assumes specific layout in DeviceNode
    const portIds = Object.values(device.ports).map(p => p.id);
    const index = portIds.indexOf(portId);
    if (index === -1) return null;

    // Split into inputs (left) and outputs (right)
    const inputs = Object.values(device.ports).filter(p => p.direction === 'INPUT');
    const outputs = Object.values(device.ports).filter(p => p.direction === 'OUTPUT');

    const inputIndex = inputs.findIndex(p => p.id === portId);
    const outputIndex = outputs.findIndex(p => p.id === portId);

    const headerHeight = 36;
    const portHeight = 32; // Approx height including gap

    if (inputIndex !== -1) {
        return {
            x: device.position.x + 10, // Left padding
            y: device.position.y + headerHeight + (inputIndex * portHeight) + 16 // + half height
        };
    }

    if (outputIndex !== -1) {
        return {
            x: device.position.x + (device.width || 200) - 10, // Right padding
            y: device.position.y + headerHeight + (outputIndex * portHeight) + 16
        };
    }

    return null;
};

export const Workspace: React.FC = () => {
    const { devices, cables, addDevice, removeDevice, updateDevicePosition, connectPorts, disconnectCable, updateDeviceState, selectedCableType, setSelectedCableType, updateDeviceLabel } = useAudioSimulation();
    const { verifySetup } = useVerification(devices, cables);
    const [draftCable, setDraftCable] = useState<{ startPortId: string; currentPos: { x: number; y: number } } | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
    const [miniGameVisible, setMiniGameVisible] = useState<boolean>(true);
    const [toolbarsVisible, setToolbarsVisible] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDeviceMove = (id: string, x: number, y: number) => {
        updateDevicePosition(id, x, y);
    };

    const handlePortMouseDown = (portId: string, e: React.MouseEvent) => {
        // Start cabling
        // Calculate start pos
        // We need to find the device and port
        const device = devices.find(d => Object.values(d.ports).some(p => p.id === portId));
        if (!device) return;

        const pos = getPortPosition(device, portId);
        if (pos) {
            setDraftCable({
                startPortId: portId,
                currentPos: { x: e.clientX, y: e.clientY } // Will update on mouse move
            });
        }
    };

    const handlePortMouseUp = (portId: string) => {
        if (draftCable) {
            connectPorts(draftCable.startPortId, portId);
            setDraftCable(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draftCable && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDraftCable({
                ...draftCable,
                currentPos: {
                    x: e.clientX - rect.left + containerRef.current.scrollLeft, // Adjust if scroll
                    y: e.clientY - rect.top + containerRef.current.scrollTop
                }
            });
        }
    };

    const handleMouseUp = () => {
        if (draftCable) {
            setDraftCable(null); // Cancel
        }
    }

    // Inventory Handlers
    const spawnDevice = (type: string) => {
        const pos = { x: 100 + devices.length * 20, y: 100 + devices.length * 20 };
        switch (type) {
            case 'MIC': addDevice(createMicrophone(pos)); break;
            case 'MIXER': addDevice(createMixer(4, pos)); break;
            case 'AMP': addDevice(createAmplifier(pos)); break;
            case 'CROSSOVER': addDevice(createCrossover(pos)); break;
            case 'SPEAKER': addDevice(createSpeaker(pos)); break;
        }
    }

    const connectedPortIds = useMemo(() => {
        const ids = new Set<string>();
        cables.forEach(c => {
            ids.add(c.sourceId);
            ids.add(c.targetId);
        });
        return ids;
    }, [cables]);

    return (
        <div className="flex h-screen w-full overflow-hidden flex-col md:flex-row">
            {toolbarsVisible && (
                <>
                    <CableToolbar selectedType={selectedCableType} onSelect={setSelectedCableType} />
                    <DeleteToolbar isDeleteMode={isDeleteMode} onToggle={setIsDeleteMode} />
                </>
            )}
            {miniGameVisible && <MiniGame devices={devices} />}

            {/* Toggle Buttons - Floating Control Panel */}
            <div className="absolute top-4 right-4 z-50 bg-gray-900 p-2 rounded-lg shadow-xl flex flex-col gap-2">
                <button
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-xs font-bold"
                    title="Inventar ein/aus"
                >
                    📦 {sidebarVisible ? '◀' : '▶'}
                </button>
                <button
                    onClick={() => setMiniGameVisible(!miniGameVisible)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-xs font-bold"
                    title="Challenge ein/aus"
                >
                    ⚡ {miniGameVisible ? '✕' : '✓'}
                </button>
                <button
                    onClick={() => setToolbarsVisible(!toolbarsVisible)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-xs font-bold"
                    title="Werkzeuge ein/aus"
                >
                    🔧 {toolbarsVisible ? '✕' : '✓'}
                </button>
            </div>

            {/* Sidebar */}
            {sidebarVisible && (
                <div className="w-full md:w-64 bg-gray-800 text-white p-2 md:p-4 flex flex-col gap-2 md:gap-4 z-20 shadow-xl max-h-48 md:max-h-full overflow-y-auto">
                    <h1 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Schultechnik Sim</h1>

                    <div className="bg-gray-700 p-2 rounded border border-green-600">
                        <button
                            onClick={verifySetup}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-1 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>✅</span> System Check
                        </button>
                        <p className="text-[10px] text-gray-400 text-center">Prüft Verkabelung & Signal</p>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1">
                        <p className="text-sm text-gray-400 uppercase">Inventar</p>
                        <button onClick={() => spawnDevice('MIC')} className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">Mikrofon</button>
                        <button onClick={() => spawnDevice('MIXER')} className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">Mischpult</button>
                        <button onClick={() => spawnDevice('AMP')} className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">Endstufe</button>
                        <button onClick={() => spawnDevice('CROSSOVER')} className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">Frequenzweiche</button>
                        <button onClick={() => spawnDevice('SPEAKER')} className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-left">Lautsprecher</button>
                    </div>

                    <div className="mt-auto">
                        <p className="text-xs text-gray-500">Links ziehen zum Bewegen.</p>
                        <p className="text-xs text-gray-500">Von Anschluss zu Anschluss ziehen zum Verkabeln.</p>
                    </div>
                </div>
            )}


            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 bg-gray-100 relative overflow-auto"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Cable Layer (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                    {cables.map(cable => {
                        const sourceDevice = devices.find(d => Object.values(d.ports).some(p => p.id === cable.sourceId));
                        const targetDevice = devices.find(d => Object.values(d.ports).some(p => p.id === cable.targetId));

                        if (!sourceDevice || !targetDevice) return null;

                        const start = getPortPosition(sourceDevice, cable.sourceId);
                        const end = getPortPosition(targetDevice, cable.targetId);

                        if (!start || !end) return null;

                        return (
                            <CableLine
                                key={cable.id}
                                start={start}
                                end={end}
                                color={cable.color}
                                onClick={() => {
                                    if (isDeleteMode) {
                                        disconnectCable(cable.id);
                                    } else {
                                        disconnectCable(cable.id); // Default behavior is also disconnect for now, but explicit is better
                                    }
                                }}
                            />
                        );
                    })}

                    {draftCable && (() => {
                        const device = devices.find(d => Object.values(d.ports).some(p => p.id === draftCable.startPortId));
                        if (!device) return null;
                        const start = getPortPosition(device, draftCable.startPortId);
                        if (!start) return null;

                        return (
                            <CableLine start={start} end={draftCable.currentPos} isDraft={true} color="blue" />
                        )
                    })()}
                </svg>

                {/* Device Layer */}
                {devices.map(device => (
                    <div key={device.id} onClickCapture={(e) => {
                        if (isDeleteMode) {
                            e.stopPropagation();
                            removeDevice(device.id);
                        }
                    }}>
                        <DeviceNode
                            device={device}
                            onMove={handleDeviceMove}
                            onPortMouseDown={handlePortMouseDown}
                            onPortMouseUp={handlePortMouseUp}
                            connectedPorts={connectedPortIds}
                            onStateChange={updateDeviceState}
                            onLabelChange={updateDeviceLabel}
                        />
                    </div>
                ))}

            </div>
        </div>
    );
};
