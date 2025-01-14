import { useChainData } from "@/src/hooks/useChainData";
import { Popover, Skeleton, Typography } from "@metrom-xyz/ui";
import { useRef, useState } from "react";

import styles from "./styles.module.css";

interface ChainProps {
    id: number;
}

export function Chain({ id }: ChainProps) {
    const chainData = useChainData(id);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [chainName, setChainName] = useState<HTMLDivElement | null>(null);
    const chainNamePopoverRef = useRef<HTMLDivElement>(null);

    const ChainIcon = chainData?.icon;

    function handleChainNamePopoverOpen() {
        setPopoverOpen(true);
    }

    function handleChainNamePopoverClose() {
        setPopoverOpen(false);
    }

    return (
        <div className={styles.root}>
            <Popover
                open={popoverOpen}
                anchor={chainName}
                ref={chainNamePopoverRef}
                placement="top"
            >
                <div className={styles.chainNameContainer}>
                    <Typography weight="medium" size="sm">
                        {chainData?.name}
                    </Typography>
                </div>
            </Popover>
            <div
                ref={setChainName}
                onMouseEnter={handleChainNamePopoverOpen}
                onMouseLeave={handleChainNamePopoverClose}
            >
                {ChainIcon && <ChainIcon className={styles.icon} />}
            </div>
        </div>
    );
}

export function SkeletonChain() {
    return (
        <div className={styles.root}>
            <Skeleton circular className={styles.icon} />
        </div>
    );
}
