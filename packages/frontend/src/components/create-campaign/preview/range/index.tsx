import type { CampaignPayload } from "@/src/types";
import { useTranslations } from "next-intl";
import { TextField, Typography } from "@metrom-xyz/ui";
import { formatAmount } from "@/src/utils/format";

import styles from "./styles.module.css";

interface RangeProps {
    pool: CampaignPayload["pool"];
    specification: CampaignPayload["rangeSpecification"];
}

export function Range({ pool, specification }: RangeProps) {
    const t = useTranslations("campaignPreview.range");

    return (
        <div className={styles.root}>
            <Typography uppercase weight="medium">
                {t("title")}
            </Typography>
            <div className={styles.fields}>
                <TextField
                    boxed
                    size="xl"
                    label={t("upperPrice.label")}
                    value={t("upperPrice.value", {
                        token0: pool?.tokens[0].symbol,
                        token1: pool?.tokens[1].symbol,
                        price: formatAmount({
                            amount: specification?.from.price,
                        }),
                    })}
                />
                <TextField
                    boxed
                    size="xl"
                    label={t("upperPrice.label")}
                    value={t("upperPrice.value", {
                        token0: pool?.tokens[0].symbol,
                        token1: pool?.tokens[1].symbol,
                        price: formatAmount({
                            amount: specification?.to.price,
                        }),
                    })}
                />
            </div>
        </div>
    );
}
