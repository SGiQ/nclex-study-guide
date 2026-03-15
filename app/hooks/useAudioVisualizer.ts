import { useState, useEffect, useRef } from 'react';

export function useAudioVisualizer(analyser: AnalyserNode | null, isPlaying: boolean, barCount: number = 10) {
    const [audioData, setAudioData] = useState<number[]>(new Array(barCount).fill(15));
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (!analyser || !isPlaying) {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            // Gentle fall off to 15% minimum height when paused
            setAudioData(prev => prev.map(v => Math.max(15, v - 10)));
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const update = () => {
            analyser.getByteFrequencyData(dataArray);
            
            const step = Math.floor(dataArray.length / barCount);
            const newData = [];
            
            for (let i = 0; i < barCount; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArray[i * step + j];
                }
                const average = sum / step;
                // Normalize 0-255 to percentage, ensure at least 15% height
                newData.push(Math.max(15, (average / 255) * 100));
            }
            
            setAudioData(newData);
            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [analyser, isPlaying, barCount]);

    return audioData;
}
