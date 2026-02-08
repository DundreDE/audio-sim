import React from 'react';

interface LevelMeterProps {
    level: number; // -60 to +10 dB
    clipping?: boolean;
    height?: number;
    width?: number;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({ level, clipping = false, height = 100, width = 10 }) => {
    // Map dB to percentage (approximate)
    // Range: -60dB (0%) to +10dB (100%)
    const minDb = -60;
    const maxDb = 10;
    const range = maxDb - minDb;
    const clampedLevel = Math.max(minDb, Math.min(maxDb, level));
    const percentage = ((clampedLevel - minDb) / range) * 100;

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="relative bg-black rounded overflow-hidden flex flex-col-reverse"
                style={{ height, width }}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #333 1px, transparent 1px)', backgroundSize: '100% 10%' }}
                />

                {/* Meter Bar */}
                <div
                    className={`w-full transition-all duration-75 ${clipping ? 'bg-red-600' :
                            level > 0 ? 'bg-yellow-500' :
                                'bg-green-500'
                        }`}
                    style={{ height: `${percentage}%` }}
                />
            </div>
            {/* Clip LED */}
            <div className={`w-2 h-2 rounded-full ${clipping ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]' : 'bg-red-900'}`} />
        </div>
    );
};
