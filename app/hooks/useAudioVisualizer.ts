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
            
            setAudioData(prev => {
                const newData = [];
                for (let i = 0; i < barCount; i++) {
                    let sum = 0;
                    // Focus on the lower-to-mid range for voice impact
                    for (let j = 0; j < step; j++) {
                        sum += dataArray[i * step + j];
                    }
                    const average = sum / step;
                    
                    // Boost sensitivity for voice frequencies
                    // Using a slight exponent to make quieter sounds more visible
                    const targetHeight = Math.max(15, Math.pow(average / 255, 0.7) * 100);
                    
                    // Smooth decay: if new height is lower, drop slowly. If higher, jump up.
                    const prevHeight = prev[i] || 15;
                    if (targetHeight > prevHeight) {
                        newData.push(targetHeight); // Quick response to volume increase
                    } else {
                        newData.push(prevHeight * 0.85 + targetHeight * 0.15); // Slow decay
                    }
                }
                return newData;
            });
            
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
