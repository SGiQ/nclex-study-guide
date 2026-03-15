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
    // Focus frequencies: voice is typically 80Hz - 8kHz. 
    // Analyser covers 0Hz to SampleRate/2 (e.g., 22k if SR is 44k).
    // We'll focus on the first 40% of the frequency bin count to cover voice well.
    const focusedCount = Math.floor(dataArray.length * 0.4);
    const step = Math.floor(focusedCount / barCount);
    const rollingPeakRef = { current: 150 }; // Tracks recent volume peaks

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      // 1. Calculate the current peak in the focused range for AGC
      let currentFramePeak = 50; // floor for peaks
      for (let i = 0; i < focusedCount; i++) {
        if (dataArray[i] > currentFramePeak) currentFramePeak = dataArray[i];
      }
      
      // Gradually adjust the rolling peak (AGC)
      rollingPeakRef.current = rollingPeakRef.current * 0.98 + currentFramePeak * 0.02;
      const gainFactor = 255 / Math.max(50, rollingPeakRef.current);

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        let sum = 0;
        // Group frequency bins for this bar
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const average = sum / step;

        // Apply Gain (AGC) and non-linear sensitivity
        // We use (1 - sensitivity) so that a high sensitivity prop = more movement
        const rawNormalized = (average * gainFactor) / 255;
        const reactiveExponent = 1.2 - (sensitivity * 0.8); // Range: 1.2 to 0.4
        const targetHeight = Math.max(15, Math.pow(rawNormalized, reactiveExponent) * 110);

        // LERP (Linear Interpolation) for butter-smooth movement
        const prevHeight = currentHeightsRef.current[i];
        let nextHeight;

        if (targetHeight > prevHeight) {
          // Fast rise: 60% transition
          nextHeight = prevHeight * 0.4 + targetHeight * 0.6;
        } else {
          // Constant decay: looks more natural than proportional decay
          nextHeight = Math.max(targetHeight, prevHeight - 2.5);
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
