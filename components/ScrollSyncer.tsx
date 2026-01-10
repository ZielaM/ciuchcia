
import React from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

interface ScrollSyncerProps {
    progress: React.MutableRefObject<number>;
    stops: number[];
    isAutopilot: boolean;
    forceSync?: boolean;
    onSyncComplete?: () => void;
}

export function ScrollSyncer({ progress, stops, isAutopilot, forceSync, onSyncComplete }: ScrollSyncerProps) {
    const scroll = useScroll();
    const startT = stops[0];
    const endT = stops[stops.length - 1];
    const range = endT - startT;

    // Frame counter to ensure sync "sticks" for a few frames
    const syncFrames = React.useRef(0);

    // Initial HARD snap using layout effect (before paint)
    React.useLayoutEffect(() => {
        if (forceSync && scroll.el) {
            const currentOffset = (progress.current - startT) / range;
            scroll.offset = currentOffset;
            scroll.el.scrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
            // Force Drei to update its internal offset immediately
            scroll.el.dispatchEvent(new Event('scroll'));
            syncFrames.current = 60; // Sustain for ~1 second (Brute force override)
        }
    }, [forceSync, scroll.el, range, startT, progress]);

    useFrame(() => {
        if (isAutopilot || (forceSync && syncFrames.current > 0)) {
            // Auto-scroll: Sync DOM scrollbar to 3D progress
            const currentOffset = (progress.current - startT) / range;
            scroll.offset = currentOffset;
            if (scroll.el) {
                const targetScrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                // FORCE every frame: do not check diff.
                scroll.el.scrollTop = targetScrollTop;
                scroll.el.dispatchEvent(new Event('scroll'));
            }

            // Decrement frame counter if forcing
            if (forceSync && syncFrames.current > 0) {
                syncFrames.current -= 1;
                if (syncFrames.current === 0 && onSyncComplete) {
                    onSyncComplete();
                }
            }
        } else {
            // Manual scroll: Sync 3D progress to DOM scrollbar
            progress.current = startT + scroll.offset * range;
        }
    }, -2); // Late update to ensure smooth sync

    return null;
}
