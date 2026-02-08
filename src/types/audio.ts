export type PortType = 'XLR' | 'JACK' | 'SPEAKON' | 'Power' | 'RCA';
export type PortDirection = 'INPUT' | 'OUTPUT';

export interface Port {
    id: string;
    name: string;
    type: PortType;
    direction: PortDirection;
    connectedTo?: string; // ID of the port it's connected to
    deviceId: string;
}

export interface Cable {
    id: string;
    sourceId: string; // Port ID
    targetId: string; // Port ID
    type: PortType;
    color: string;
}

export type DeviceType = 'SOURCE' | 'MIXER' | 'PROCESSOR' | 'AMPLIFIER' | 'SPEAKER';

export interface Device {
    id: string;
    name: string;
    type: DeviceType;
    ports: Record<string, Port>;
    position: { x: number; y: number };
    // Visual properties
    image?: string;
    width?: number;
    height?: number;
    state?: Record<string, number>;
    labels?: Record<string, string>; // custom labels for ports/channels
}
