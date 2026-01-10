
import React from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

interface ScrollSyncerProps {
    progress: React.MutableRefObject<number>;
    stops: number[];
    isAutopilot: boolean;
}

export function ScrollSyncer({ progress, stops, isAutopilot }: ScrollSyncerProps) {
    const scroll = useScroll();
    const startT = stops[0];
    const endT = stops[stops.length - 1];
    const range = endT - startT;

    useFrame(() => {
        if (isAutopilot) {
            // Auto-scroll: Sync DOM scrollbar to 3D progress
            const currentOffset = (progress.current - startT) / range;
            scroll.offset = currentOffset;
            if (scroll.el) {
                const targetScrollTop = currentOffset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                scroll.el.scrollTop = targetScrollTop;
            }
        } else {
            // Manual scroll: Sync 3D progress to DOM scrollbar
            progress.current = startT + scroll.offset * range;
        }
    }, -2); // Late update to ensure smooth sync

    return null;
}
