
import React from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

interface ScrollSyncerProps {
    progressRef: React.MutableRefObject<number>;
    stops: number[];
    isAutopilot: boolean;
    forceSync?: boolean;
    onSyncComplete?: () => void;
}

export function ScrollSyncer({ progressRef, stops, isAutopilot, forceSync, onSyncComplete }: ScrollSyncerProps) {
    const scroll = useScroll();
    const startT = stops[0];
    const endT = stops[stops.length - 1];
    const range = endT - startT;

    // Frame counter to ensure sync "sticks" for a few frames
    const syncFrames = React.useRef(0);

    // Initial HARD snap using layout effect (before paint)
    React.useLayoutEffect(() => {
        if (forceSync && scroll.el) {
            const currentOffset = (progressRef.current - startT) / range;
            // eslint-disable-next-line react-hooks/immutability
            scroll.offset = currentOffset;
            // eslint-disable-next-line react-hooks/immutability
            scroll.el.scrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
            // Force Drei to update its internal offset immediately
            scroll.el.dispatchEvent(new Event('scroll'));
            // Force sustain for ~1 second to handle any frame drops or layout thrashing during initialization
            syncFrames.current = 60;
        }
    }, [forceSync, scroll, range, startT, progressRef]);

    useFrame(() => {
        if (isAutopilot || (forceSync && syncFrames.current > 0)) {
            // Auto-scroll: Sync DOM scrollbar to 3D progress
            const currentOffset = (progressRef.current - startT) / range;
            // eslint-disable-next-line react-hooks/immutability
            scroll.offset = currentOffset;
            if (scroll.el) {
                const targetScrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                // Force sync every frame to ensure DOM matches 3D state exactly during animations
                // eslint-disable-next-line react-hooks/immutability
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
            progressRef.current = startT + scroll.offset * range;
        }
    }, -2); // Late update to ensure smooth sync

    return null;
}
