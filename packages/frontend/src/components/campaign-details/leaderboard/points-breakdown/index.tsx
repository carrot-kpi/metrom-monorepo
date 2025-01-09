import { Typography } from "@metrom-xyz/ui";
import type { OnChainAmount } from "@metrom-xyz/sdk";
import { formatAmount } from "@/src/utils/format";

import styles from "./styles.module.css";

interface PointsBreakdownProps {
    distributed: OnChainAmount;
}

export function PointsBreakdown({ distributed }: PointsBreakdownProps) {
    return (
        <div className={styles.rankWrapper}>
            <Typography weight="medium" light>
                {formatAmount({ amount: distributed.formatted })}
            </Typography>
        </div>
    );
}
