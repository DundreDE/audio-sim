import React, { useState, useEffect } from 'react';
import type { Device } from '../types/audio';

interface MiniGameProps {
    devices: Device[];
}

export const MiniGame: React.FC<MiniGameProps> = ({ devices }) => {
    const [targetChannel, setTargetChannel] = useState<number>(1);
    const [targetLevel] = useState<number>(-6); // dB - Constant for now
    const [tolerance] = useState<number>(3); // +/- dB - Constant for now
    const [progress, setProgress] = useState<number>(0);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    // Game Loop
    useEffect(() => {
        if (isComplete) return;

        const mixer = devices.find(d => d.type === 'MIXER');
        if (!mixer) {
            setMessage("Bitte ein Mischpult hinzufügen!");
            return;
        }

        setMessage(`Pegel Kanal ${targetChannel} auf ${targetLevel}dB ein (+/- ${tolerance}dB)`);

        const currentLevel = mixer.state?.[`ch${targetChannel}_level`];

        if (currentLevel !== undefined) {
            const diff = Math.abs(currentLevel - targetLevel);
            if (diff <= tolerance) {
                setProgress(prev => Math.min(100, prev + 2)); // Increase progress
            } else {
                setProgress(prev => Math.max(0, prev - 5)); // Decay progress
            }
        }

        if (progress >= 100) {
            setIsComplete(true);
            setMessage(`Kanal ${targetChannel} erfolgreich eingepegelt!`);
            // Auto-advance after delay (optional, simplified here)
            setTimeout(() => {
                const nextCh = targetChannel < 4 ? targetChannel + 1 : 1;
                setTargetChannel(nextCh);
                setProgress(0);
                setIsComplete(false);
            }, 2000);
        }

    }, [devices, targetChannel, targetLevel, tolerance, progress, isComplete]);

    return (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl w-64 border-2 border-yellow-500 z-50">
            <h2 className="text-lg font-bold text-yellow-500 mb-2">⚡ Gain Challenge</h2>

            <div className="mb-4">
                <p className="text-sm">{message}</p>
                <p className="text-[10px] text-gray-400 mt-1">Benutze den ROTEN Gain-Regler!</p>
                {/* Target Range Visual */}
                <div className="mt-2 text-xs text-gray-400">Target: {targetLevel - tolerance}dB ... {targetLevel + tolerance}dB</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
                <div
                    className={`h-full transition-all duration-100 ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-right text-xs mt-1 text-gray-400">{Math.round(progress)}%</p>
        </div>
    );
};
