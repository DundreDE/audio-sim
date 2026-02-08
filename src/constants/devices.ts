import type { Device, Port, PortType, PortDirection } from '../types/audio';
import { v4 as uuidv4 } from 'uuid';

export const createPort = (
    deviceId: string,
    name: string,
    type: PortType,
    direction: PortDirection
): Port => ({
    id: uuidv4(),
    deviceId,
    name,
    type,
    direction,
});

export const createMicrophone = (position = { x: 0, y: 0 }): Device => {
    const deviceId = uuidv4();
    return {
        id: deviceId,
        name: 'Mikrofon',
        type: 'SOURCE',
        position,
        ports: {
            output: createPort(deviceId, 'Ausgang', 'XLR', 'OUTPUT'),
        },
    };
};

export const createMixer = (channels = 4, position = { x: 0, y: 0 }): Device => {
    const deviceId = uuidv4();
    const ports: Record<string, Port> = {};

    for (let i = 1; i <= channels; i++) {
        ports[`ch${i}_input`] = createPort(deviceId, `Kanal ${i}`, 'XLR', 'INPUT');
    }
    ports['main_out_l'] = createPort(deviceId, 'Main L', 'XLR', 'OUTPUT');
    ports['main_out_r'] = createPort(deviceId, 'Main R', 'XLR', 'OUTPUT');

    return {
        id: deviceId,
        name: `${channels}-Kanal Mischpult`,
        type: 'MIXER',
        position,
        ports,
        width: 300,
        height: 400,
    };
};

export const createAmplifier = (position = { x: 0, y: 0 }): Device => {
    const deviceId = uuidv4();
    return {
        id: deviceId,
        name: 'Endstufe',
        type: 'AMPLIFIER',
        position,
        ports: {
            input_l: createPort(deviceId, 'Eingang L', 'XLR', 'INPUT'),
            input_r: createPort(deviceId, 'Eingang R', 'XLR', 'INPUT'),
            output_l: createPort(deviceId, 'Ausgang L', 'SPEAKON', 'OUTPUT'),
            output_r: createPort(deviceId, 'Ausgang R', 'SPEAKON', 'OUTPUT'),
        },
        width: 200,
        height: 100,
    };
};

export const createSpeaker = (position = { x: 0, y: 0 }): Device => {
    const deviceId = uuidv4();
    return {
        id: deviceId,
        name: 'Lautsprecher',
        type: 'SPEAKER',
        position,
        ports: {
            input: createPort(deviceId, 'Eingang', 'SPEAKON', 'INPUT'),
        },
        width: 150,
        height: 250,
    };
};

export const createCrossover = (position = { x: 0, y: 0 }): Device => {
    const deviceId = uuidv4();
    return {
        id: deviceId,
        name: 'Frequenzweiche',
        type: 'PROCESSOR',
        position,
        ports: {
            input_l: createPort(deviceId, 'Eingang L', 'XLR', 'INPUT'),
            input_r: createPort(deviceId, 'Eingang R', 'XLR', 'INPUT'),
            high_l: createPort(deviceId, 'High L', 'XLR', 'OUTPUT'),
            high_r: createPort(deviceId, 'High R', 'XLR', 'OUTPUT'),
            mid_l: createPort(deviceId, 'Mid L', 'XLR', 'OUTPUT'),
            mid_r: createPort(deviceId, 'Mid R', 'XLR', 'OUTPUT'),
            low_l: createPort(deviceId, 'Low L', 'XLR', 'OUTPUT'),
            low_r: createPort(deviceId, 'Low R', 'XLR', 'OUTPUT'),
        },
        width: 250,
        height: 250,
    };
};
