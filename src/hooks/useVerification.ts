import { useCallback } from 'react';
import type { Device, Cable } from '../types/audio';

export const useVerification = (devices: Device[], cables: Cable[]) => {
    const verifySetup = useCallback(() => {
        const issues: string[] = [];
        const successes: string[] = [];

        // 1. Check Source (Mic)
        const mic = devices.find(d => d.type === 'SOURCE');
        if (!mic) {
            issues.push("Kein Mikrofon gefunden.");
        } else {
            // Check connection to Mixer
            const micOut = Object.values(mic.ports).find(p => p.direction === 'OUTPUT');
            const micCable = cables.find(c => c.sourceId === micOut?.id || c.targetId === micOut?.id);
            if (!micCable) {
                issues.push("Mikrofon ist nicht angeschlossen.");
            } else {
                successes.push("Mikrofon angeschlossen.");
            }
        }

        // 2. Check Mixer
        const mixer = devices.find(d => d.type === 'MIXER');
        if (!mixer) {
            issues.push("Kein Mischpult gefunden.");
        } else {
            // Check Main Outs
            const mainOutL = Object.values(mixer.ports).find(p => p.name === 'Main L');
            const mainOutR = Object.values(mixer.ports).find(p => p.name === 'Main R');

            const cableL = cables.find(c => c.sourceId === mainOutL?.id || c.targetId === mainOutL?.id);
            const cableR = cables.find(c => c.sourceId === mainOutR?.id || c.targetId === mainOutR?.id);

            if (!cableL && !cableR) {
                issues.push("Mischpult Main Output ist nicht angeschlossen.");
            } else {
                successes.push("Mischpult Output verbunden.");
            }
        }

        // 3. Check Amp connection
        const amp = devices.find(d => d.type === 'AMPLIFIER');
        if (amp) {
            const inputL = Object.values(amp.ports).find(p => p.name.includes('Eingang'));
            const inputCable = cables.find(c => c.targetId === inputL?.id || c.sourceId === inputL?.id);
            if (!inputCable) {
                issues.push("Endstufe hat kein Eingangssignal.");
            } else {
                successes.push("Endstufe verbunden.");
            }
        }

        // 4. Check Speaker
        const speaker = devices.find(d => d.type === 'SPEAKER');
        if (!speaker) {
            issues.push("Keine Lautsprecher gefunden.");
        } else {
            const input = Object.values(speaker.ports).find(p => p.direction === 'INPUT');
            const cable = cables.find(c => c.targetId === input?.id || c.sourceId === input?.id);
            if (!cable) {
                issues.push("Lautsprecher ist nicht angeschlossen.");
            } else {
                successes.push("Lautsprecher angeschlossen.");
            }
        }

        if (issues.length === 0) {
            alert("✅ Alles korrekt verkabelt! (Systemprüfung erfolgreich)");
        } else {
            alert("⚠️ Probleme gefunden:\n\n" + issues.join("\n"));
        }

    }, [devices, cables]);

    return { verifySetup };
};
