import React from 'react';
import type { PortType } from '../types/audio';

interface CableToolbarProps {
    selectedType: PortType | null;
    onSelect: (type: PortType) => void;
}

export const CableToolbar: React.FC<CableToolbarProps> = ({ selectedType, onSelect }) => {
    const cables: { type: PortType; label: string; color: string }[] = [
        { type: 'XLR', label: 'XLR (Mikrofon/Signal)', color: 'bg-black' },
        { type: 'SPEAKON', label: 'Speakon (Lautsprecher)', color: 'bg-blue-600' },
        // { type: 'JACK', label: 'Klinke (Instrument)', color: 'bg-gray-400' }, // Future use
    ];

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-xl z-50 flex gap-2 border-2 border-gray-300">
            <span className="text-sm font-bold self-center mr-2 text-gray-700">Kabel:</span>
            {cables.map((cable) => (
                <button
                    key={cable.type}
                    onClick={() => onSelect(cable.type)}
                    className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${selectedType === cable.type
                            ? 'bg-green-100 border-2 border-green-500 shadow-inner'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                        }`}
                >
                    <div className={`w-3 h-3 rounded-full ${cable.color}`} />
                    <span className={`text-sm ${selectedType === cable.type ? 'font-bold text-green-800' : 'text-gray-700'}`}>
                        {cable.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
