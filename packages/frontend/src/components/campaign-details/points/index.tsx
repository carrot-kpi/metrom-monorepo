import { TextField, Typography } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { NamedCampaign } from "@/src/hooks/useCampaigns";
import { formatAmount } from "@/src/utils/format";

import styles from "./styles.module.css";

interface PointsProps {
    campaign: NamedCampaign;
    loading: boolean;
}

export function Points({ campaign, loading }: PointsProps) {
    const t = useTranslations("campaignDetails.points");

    const dailyPoints = useMemo(() => {
        if (!campaign.points) return 0;

        const hoursDuration = dayjs
            .unix(campaign.to)
            .diff(dayjs.unix(campaign.from), "hours", false);
        const daysDuration = hoursDuration / 24;

        return daysDuration >= 1 ? campaign.points.formatted / daysDuration : 0;
    }, [campaign]);

    return (
        <div className={styles.root}>
            <Typography size="lg" weight="medium" uppercase>
                {t("title")}
            </Typography>
            <div className={styles.summary}>
                <TextField
                    boxed
                    size="xl"
                    label={t("total")}
                    loading={loading || !campaign}
                    value={formatAmount({
                        amount: campaign.points?.formatted,
                    })}
                />
                <TextField
                    boxed
                    size="xl"
                    label={t("daily")}
                    loading={loading || !campaign}
                    value={formatAmount({
                        amount: dailyPoints,
                    })}
                />
            </div>
        </div>
    );
}
