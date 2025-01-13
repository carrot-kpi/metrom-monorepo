import { getPrice } from "@metrom-xyz/sdk";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { useTranslations } from "next-intl";
import { TextField, Typography } from "@metrom-xyz/ui";
import { formatAmount } from "@/src/utils/format";
import { useLiquidityDensity } from "@/src/hooks/useLiquidityDensity";
import { LiquidityDensityChart } from "../../liquidity-density-chart";
import classNames from "classnames";

import styles from "./styles.module.css";

interface PriceRangeProps {
    campaign?: NamedCampaign;
}

export function PriceRange({ campaign }: PriceRangeProps) {
    const t = useTranslations("campaignDetails.priceRange");

    const { liquidityDensity, loading: loadingLiquidityDensity } =
        useLiquidityDensity(campaign?.pool, campaign?.chainId);

    if (!campaign?.specification?.priceRange) return null;

    const { priceRange } = campaign.specification;

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <Typography size="lg" weight="medium" uppercase>
                    {t("title")}
                </Typography>
                <div className={styles.topContent}>
                    <TextField
                        boxed
                        size="xl"
                        label={t("lowerPrice.label")}
                        value={t("lowerPrice.value", {
                            token0: campaign.pool.tokens[0].symbol,
                            token1: campaign.pool.tokens[1].symbol,
                            price: formatAmount({
                                amount: getPrice(
                                    priceRange.from,
                                    campaign.pool,
                                ),
                            }),
                        })}
                    />
                    <TextField
                        boxed
                        size="xl"
                        label={t("upperPrice.label")}
                        value={t("upperPrice.value", {
                            token0: campaign.pool.tokens[0].symbol,
                            token1: campaign.pool.tokens[1].symbol,
                            price: formatAmount({
                                amount: getPrice(priceRange.to, campaign.pool),
                            }),
                        })}
                    />
                </div>
                <div className={styles.chart}>
                    <Typography size="sm" uppercase light weight="medium">
                        {t("chart")}
                    </Typography>
                    <div className={classNames(styles.chartWrapper)}>
                        <LiquidityDensityChart
                            pool={campaign.pool}
                            from={priceRange.from}
                            to={priceRange.to}
                            liquidityDensity={liquidityDensity}
                            loading={loadingLiquidityDensity}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
