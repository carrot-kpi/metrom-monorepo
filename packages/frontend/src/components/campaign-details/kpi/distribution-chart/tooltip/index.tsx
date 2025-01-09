import { formatPercentage, formatAmount } from "@/src/utils/format";
import styles from "./styles.module.css";
import { useTranslations } from "next-intl";
import { Typography } from "@metrom-xyz/ui";
import type { DistributionChartData } from "..";
import { RemoteLogo } from "@/src/components/remote-logo";
import type { SupportedChain } from "@metrom-xyz/contracts";
import dayjs from "dayjs";
import classNames from "classnames";

interface Payload {
    payload: DistributionChartData;
}

interface TooltipProps {
    chain?: SupportedChain;
    active?: boolean;
    payload?: Payload[];
}

export function TooltipContent({ chain, active, payload }: TooltipProps) {
    const t = useTranslations("distributionChart.tooltip");

    if (!active || !payload || !payload.length) return null;

    const { distributions, to, distributed, reimbursed } = payload[0].payload;

    if (distributions.length === 0) return null;

    return (
        <div className={styles.root}>
            <div className={styles.fieldWrapper}>
                <Typography weight="medium" light uppercase>
                    {t("time")}
                </Typography>
                <Typography weight="medium" uppercase>
                    {dayjs.unix(to).format("DD MMM HH:mm")}
                </Typography>
            </div>
            <div className={styles.fieldWrapper}>
                <div className={styles.textWrapper}>
                    <div
                        className={classNames(
                            styles.legendDot,
                            styles.reimbursed,
                        )}
                    ></div>
                    <Typography weight="medium" light uppercase>
                        {t("reimbursed")}
                    </Typography>
                </div>
                <Typography weight="medium" uppercase>
                    {formatPercentage(reimbursed * 100)}
                </Typography>
            </div>
            <div className={styles.fieldWrapper}>
                <div className={styles.textWrapper}>
                    <div
                        className={classNames(
                            styles.legendDot,
                            styles.distributed,
                        )}
                    ></div>
                    <Typography weight="medium" light uppercase>
                        {t("distributed")}
                    </Typography>
                </div>
                <Typography weight="medium" uppercase>
                    {formatPercentage(distributed * 100)}
                </Typography>
            </div>
            <div className={classNames(styles.row, styles.breakdownWrapper)}>
                <Typography weight="medium" light uppercase>
                    {t("token")}
                </Typography>
                <Typography weight="medium" light uppercase>
                    {t("distributed")}
                </Typography>
                <Typography weight="medium" light uppercase>
                    {t("reimbursed")}
                </Typography>
            </div>
            {distributions.map(({ distributed, reimbursed, token }) => (
                <div key={token.address} className={styles.row}>
                    <div className={styles.tokenWrapper}>
                        <RemoteLogo address={token.address} chain={chain} />
                        <Typography weight="medium">{token.symbol}</Typography>
                    </div>
                    <Typography weight="medium">
                        {formatAmount({
                            amount: distributed.formatted,
                        })}
                    </Typography>
                    <Typography weight="medium">
                        {formatAmount({
                            amount: reimbursed.formatted,
                        })}
                    </Typography>
                </div>
            ))}
        </div>
    );
}
