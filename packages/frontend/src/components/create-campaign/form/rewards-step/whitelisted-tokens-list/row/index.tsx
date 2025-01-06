import { useCallback } from "react";
import { type WhitelistedErc20Token } from "@metrom-xyz/sdk";
import type { Erc20TokenWithBalance } from "@/src/hooks/useWatchBalances";
import classNames from "classnames";
import { Typography, Skeleton } from "@metrom-xyz/ui";
import { formatAmount, formatUsdAmount } from "@/src/utils/format";
import { RemoteLogo } from "@/src/components/remote-logo";

import styles from "./styles.module.css";

interface PickerRowProps {
    tokenWithBalance: Erc20TokenWithBalance<WhitelistedErc20Token> | null;
    chain: number;
    style?: any;
    loading?: boolean;
    disabled?: boolean;
    active?: boolean;
    onClick: (token: WhitelistedErc20Token) => void;
}

export function Row({
    tokenWithBalance,
    chain,
    style,
    loading,
    disabled,
    active,
    onClick,
}: PickerRowProps) {
    const handleRewardTokenOnClick = useCallback(() => {
        if (!tokenWithBalance || disabled) return;
        onClick(tokenWithBalance.token);
    }, [disabled, onClick, tokenWithBalance]);

    return (
        <div
            style={style}
            className={classNames(styles.root, {
                [styles.loading]: loading,
                [styles.disabled]: disabled,
                [styles.active]: active,
            })}
            onClick={handleRewardTokenOnClick}
        >
            <div className={styles.token}>
                {loading ? (
                    <Skeleton circular width={36} />
                ) : (
                    <RemoteLogo
                        size="sm"
                        address={tokenWithBalance?.token.address}
                        chain={chain}
                    />
                )}
                {loading ? (
                    <Skeleton width={80} />
                ) : (
                    <Typography weight="medium" size="lg">
                        {tokenWithBalance?.token.symbol}
                    </Typography>
                )}
            </div>
            {loading || !tokenWithBalance ? (
                <div className={styles.balanceWrapper}>
                    <Skeleton width={36} size="sm" />
                    <Skeleton width={36} size="xs" />
                </div>
            ) : (
                <div className={styles.balanceWrapper}>
                    <Typography size="sm" weight="medium">
                        {tokenWithBalance.balance
                            ? formatAmount({
                                  amount: tokenWithBalance.balance.formatted,
                              })
                            : "-"}
                    </Typography>
                    <Typography size="xs" weight="medium" light>
                        {tokenWithBalance.balance
                            ? formatUsdAmount(
                                  tokenWithBalance.balance.formatted *
                                      tokenWithBalance.token.usdPrice,
                              )
                            : "-"}
                    </Typography>
                </div>
            )}
        </div>
    );
}
