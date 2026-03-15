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
                    
                    // Boost sensitivity aggressively for voice frequencies
                    // Using 0.5 exponent to pull up quieter speech sounds
                    const targetHeight = Math.max(15, Math.pow(average / 255, 0.5) * 115);
                    
                    // Very smooth decay: drop slowly to maintain a 'full' wave look
                    const prevHeight = prev[i] || 15;
                    if (targetHeight > prevHeight) {
                        // Quick rise but with slight smoothing to prevent sharp jumps
                        newData.push(prevHeight * 0.3 + targetHeight * 0.7);
                    } else {
                        // Slow decay (90% retention) creates a fluid 'falling' effect
                        newData.push(prevHeight * 0.9 + targetHeight * 0.1);
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
