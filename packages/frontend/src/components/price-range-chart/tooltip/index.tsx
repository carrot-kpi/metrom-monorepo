import { formatUsdAmount } from "@/src/utils/format";
import styles from "./styles.module.css";
import { useTranslations } from "next-intl";
import { Typography } from "@metrom-xyz/ui";
import type { PriceChartData } from "..";

interface Payload {
    payload: PriceChartData;
}

interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
}

export function TooltipContent({ active, payload }: TooltipProps) {
    const t = useTranslations("priceRangeChart.tooltip");

    if (!active || !payload || !payload.length) return null;

    const { tokens } = payload[0].payload;

    return (
        <div className={styles.root}>
            {tokens.map((token) => (
                <div key={token.address} className={styles.row}>
                    <div className={styles.tokenWrapper}>
                        <Typography weight="medium">
                            {token.symbol} {t("price")}{" "}
                            {formatUsdAmount(token.usdPrice)}
                        </Typography>
                    </div>
                </div>
            ))}
        </div>
    );
}
