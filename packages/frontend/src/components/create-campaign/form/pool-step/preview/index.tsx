import numeral from "numeral";
import type { Pool } from "@metrom-xyz/sdk";
import { PoolRemoteLogo } from "@/src/ui/pool-remote-logo";
import { Typography } from "@/src/ui/typography";

import styles from "./styles.module.css";

export interface PoolStepPreviewProps {
    pool: Pool;
}

export function PoolStepPreview({ pool }: PoolStepPreviewProps) {
    return (
        <div className={styles.root}>
            <div className={styles.pool}>
                <PoolRemoteLogo
                    token0={{
                        address: pool.token0.address,
                        defaultText: pool.token0.symbol,
                    }}
                    token1={{
                        address: pool.token1.address,
                        defaultText: pool.token1.symbol,
                    }}
                />
                <div className={styles.poolInfo}>
                    <Typography weight="medium" variant="lg">
                        {pool.token0.symbol} / {pool.token1.symbol}
                    </Typography>
                    {pool.fee && (
                        <Typography
                            variant="xs"
                            light
                            weight="medium"
                            className={{ root: styles.fee }}
                        >
                            {numeral(pool.fee).format("0.0[0]")}%
                        </Typography>
                    )}
                </div>
            </div>
            <Typography weight="medium" variant="sm" light>
                {numeral(pool.tvl).format("($ 0.00 a)")}
            </Typography>
        </div>
    );
}
