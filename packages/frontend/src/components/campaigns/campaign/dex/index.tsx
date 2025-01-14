"use client";

import { Popover, Skeleton, Typography } from "@metrom-xyz/ui";
import { useDexesInChain } from "@/src/hooks/useDexesInChain";
import type { SupportedDex } from "@metrom-xyz/sdk";
import { useRef, useState } from "react";

import styles from "./styles.module.css";

interface DexProps {
    chain: number;
    slug: SupportedDex;
}

export function Dex({ chain, slug }: DexProps) {
    const dexes = useDexesInChain(chain);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [dexDetails, setDexDetails] = useState<HTMLDivElement | null>(null);
    const dexDetailsPopoverRef = useRef<HTMLDivElement>(null);

    const dex = dexes.find((dex) => dex.slug === slug);
    const DexLogo = dex?.logo;

    function handleDexDetailsPopoverOpen() {
        setPopoverOpen(true);
    }

    function handleDexDetailsPopoverClose() {
        setPopoverOpen(false);
    }

    if (!DexLogo) return "-";

    return (
        <div className={styles.root}>
            <Popover
                open={popoverOpen}
                anchor={dexDetails}
                ref={dexDetailsPopoverRef}
                placement="top"
            >
                <div className={styles.dexDetailsContainer}>
                    <Typography weight="medium" size="sm">
                        {dex.name}
                    </Typography>
                </div>
            </Popover>
            <div
                ref={setDexDetails}
                onMouseEnter={handleDexDetailsPopoverOpen}
                onMouseLeave={handleDexDetailsPopoverClose}
            >
                <DexLogo className={styles.icon} />
            </div>
        </div>
    );
}

export function SkeletonDex() {
    return (
        <div className={styles.root}>
            <Skeleton circular className={styles.icon} />
        </div>
    );
}
