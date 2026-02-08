import React from 'react';

interface DeleteToolbarProps {
    isDeleteMode: boolean;
    onToggle: (enabled: boolean) => void;
}

export const DeleteToolbar: React.FC<DeleteToolbarProps> = ({ isDeleteMode, onToggle }) => {
    return (
        <div className="absolute top-4 left-4 z-50">
            <button
                onClick={() => onToggle(!isDeleteMode)}
                className={`p-3 rounded-full shadow-lg border-2 transition-all flex items-center justify-center ${isDeleteMode
                        ? 'bg-red-600 border-red-800 text-white animate-pulse'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                title="Lösch-Modus (Klick auf Geräte/Kabel zum Entfernen)"
            >
                {isDeleteMode ? (
                    <span className="font-bold">🗑️ AN</span>
                ) : (
                    <span>🗑️</span>
                )}
            </button>
            {isDeleteMode && (
                <div className="absolute top-full left-0 mt-2 bg-black/80 text-white text-xs p-2 rounded whitespace-nowrap">
                    Klicke auf Geräte/Kabel zum Löschen
                </div>
            )}
        </div>
    );
};
