"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  barClassName?: string;
  sensitivity?: number; // 0 to 1
}

export default function AudioVisualizer({
  analyser,
  isPlaying,
  barCount = 12,
  className = "flex items-end gap-1 h-12 w-full max-w-[120px]",
  barClassName = "flex-1 bg-cyan-400 rounded-t-sm shadow-[0_0_8px_rgba(34,211,238,0.6)]",
  sensitivity = 0.5,
}: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentHeightsRef = useRef<number[]>(new Array(barCount).fill(15));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Gentle decay to resting state (15%) when paused
      const restingState = () => {
        let hasActive = false;
        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          const current = currentHeightsRef.current[i];
          if (current > 15.1) {
            const next = current * 0.9 + 15 * 0.1;
            currentHeightsRef.current[i] = next;
            bar.style.height = `${next}%`;
            hasActive = true;
          } else {
            bar.style.height = '15%';
            currentHeightsRef.current[i] = 15;
          }
        });
        
        if (hasActive) {
          animationRef.current = requestAnimationFrame(restingState);
        }
      };
      
      animationRef.current = requestAnimationFrame(restingState);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const step = Math.floor(dataArray.length / barCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        let sum = 0;
        // Focus on low-mid frequencies for voice clarity
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const average = sum / step;

        // Non-linear sensitivity (exponent 0.5 makes quiet parts more visible)
        // Boost factor (115) ensures bars reach top nicely
        const rawTarget = (average / 255);
        const targetHeight = Math.max(15, Math.pow(rawTarget, sensitivity) * 115);

        // LERP (Linear Interpolation) for butter-smooth movement
        const prevHeight = currentHeightsRef.current[i];
        let nextHeight;

        if (targetHeight > prevHeight) {
          // Fast rise: reach 70% of distance immediately
          nextHeight = prevHeight * 0.3 + targetHeight * 0.7;
        } else {
          // Slow decay: reach 10% of distance (90% retention)
          nextHeight = prevHeight * 0.9 + targetHeight * 0.1;
        }

        currentHeightsRef.current[i] = nextHeight;
        bar.style.height = `${nextHeight}%`;
      }

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, barCount, sensitivity]);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className={barClassName}
          style={{ height: "15%", transition: 'none' }} // transition: none is CRITICAL here
        />
      ))}
    </div>
  );
}
