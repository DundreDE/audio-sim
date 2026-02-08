import { useState, useCallback, useEffect } from 'react';
import type { Device, Cable, PortType } from '../types/audio';
import { v4 as uuidv4 } from 'uuid';

export const useAudioSimulation = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [cables, setCables] = useState<Cable[]>([]);
    const [selectedCableType, setSelectedCableType] = useState<PortType>('XLR'); // Default to XLR

    const addDevice = useCallback((device: Device) => {
        setDevices((prev) => [...prev, device]);
    }, []);

    const removeDevice = useCallback((deviceId: string) => {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        // Remove associated cables
        setCables((prev) => prev.filter((c) => {
            const device = devices.find(d => d.id === deviceId);
            if (!device) return true;
            const portIds = Object.values(device.ports).map(p => p.id);
            return !portIds.includes(c.sourceId) && !portIds.includes(c.targetId);
        }));
    }, [devices]);

    const connectPorts = useCallback((sourceId: string, targetId: string) => {
        const sourceDevice = devices.find((d) => Object.values(d.ports).some((p) => p.id === sourceId));
        const targetDevice = devices.find((d) => Object.values(d.ports).some((p) => p.id === targetId));

        if (!sourceDevice || !targetDevice) return;

        const sourcePort = Object.values(sourceDevice.ports).find((p) => p.id === sourceId);
        const targetPort = Object.values(targetDevice.ports).find((p) => p.id === targetId);

        if (!sourcePort || !targetPort) return;

        // Validation: Check directions
        if (sourcePort.direction === targetPort.direction) {
            console.warn("Cannot connect two ports of the same direction");
            return;
        }

        // Validation: Check types (Simplified for now, can be expanded)
        // For now, let's just warn if types don't match, or strictly enforce it
        /*
        if (sourcePort.type !== targetPort.type) {
          console.warn(`Cannot connect ${sourcePort.type} to ${targetPort.type}`);
          return;
        }
        */

        // Check if already connected
        const isSourceConnected = cables.some(c => c.sourceId === sourceId || c.targetId === sourceId);
        const isTargetConnected = cables.some(c => c.sourceId === targetId || c.targetId === targetId);

        if (isSourceConnected || isTargetConnected) {
            console.warn("Port already connected");
            return;
        }

        // Validation: Check Cable Type
        if (selectedCableType !== sourcePort.type) {
            alert(`Falsches Kabel! Du hast ${selectedCableType} gewählt, aber der Anschluss benötigt ${sourcePort.type}.`);
            return;
        }

        const newCable: Cable = {
            id: uuidv4(),
            sourceId,
            targetId,
            type: selectedCableType,
            color: 'black', // Default color
        };

        setCables((prev) => [...prev, newCable]);
    }, [devices, cables]);

    const disconnectCable = useCallback((cableId: string) => {
        setCables((prev) => prev.filter((c) => c.id !== cableId));
    }, []);

    const updateDevicePosition = useCallback((deviceId: string, x: number, y: number) => {
        setDevices((prev) =>
            prev.map((d) => (d.id === deviceId ? { ...d, position: { x, y } } : d))
        );
    }, []);

    // Signal Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setDevices(prevDevices => {
                // Create a map of device states to avoid mutating valid state directly
                // We only want to update 'level' and 'clip' state
                return prevDevices.map(device => {
                    const newState = { ...device.state };

                    if (device.type === 'SOURCE') {
                        // Mic generates signal
                        newState['output_level'] = -50;
                    } else if (device.type === 'MIXER') {
                        // Calculate levels for each channel
                        for (let ch = 1; ch <= 4; ch++) {
                            const inputPortId = Object.values(device.ports).find(p => p.name === `Kanal ${ch}` || p.name === `CH ${ch} Input`)?.id;
                            // Find connected cable
                            const cable = cables.find(c => c.targetId === inputPortId);
                            let inputLevel = -Infinity; // Silence

                            if (cable) {
                                const sourcePortId = cable.sourceId;
                                const sourceDevice = prevDevices.find(d => Object.values(d.ports).some(p => p.id === sourcePortId));
                                if (sourceDevice) {
                                    // For now assume source is mic
                                    if (sourceDevice.type === 'SOURCE') {
                                        inputLevel = -50; // Mic level
                                    }
                                }
                            }

                            // Apply Gain
                            const gain = newState[`ch${ch}_gain`] || 0;
                            // Pre-Fader Listen (PFL) Level = Input + Gain
                            const pflLevel = inputLevel + gain;

                            // Apply Fader for Main Mix
                            const fader = newState[`ch${ch}_vol`] || -70;
                            let channelLevel = pflLevel + fader;

                            // Clip detection (check both PFL and Post-Fader)
                            const clip = (pflLevel > 0 || channelLevel > 0) ? 1 : 0;

                            // Noise floor
                            if (channelLevel < -70) channelLevel = -70;

                            newState[`ch${ch}_level`] = channelLevel;
                            newState[`ch${ch}_pfl`] = pflLevel; // Store PFL for metering/game
                            newState[`ch${ch}_clip`] = clip;
                        }
                    }

                    // Check if state actually changed to avoid re-renders if possible (simplified here)
                    return { ...device, state: newState };
                });
            });
        }, 100); // Run every 100ms

        return () => clearInterval(interval);
    }, [cables]); // Re-bind if topology changes

    return {
        devices,
        cables,
        addDevice,
        removeDevice,
        connectPorts,
        disconnectCable,
        updateDevicePosition,
        updateDeviceState: useCallback((deviceId: string, key: string, value: number) => {
            setDevices((prev) =>
                prev.map((d) => (d.id === deviceId ? { ...d, state: { ...d.state, [key]: value } } : d))
            );
        }, []),
        selectedCableType,
        setSelectedCableType,
        updateDeviceLabel: useCallback((deviceId: string, key: string, label: string) => {
            setDevices((prev) =>
                prev.map((d) => (d.id === deviceId ? { ...d, labels: { ...d.labels, [key]: label } } : d))
            );
        }, []),
    };
};
