import { useTranslations } from "next-intl";
import styles from "./styles.module.css";
import { TextField } from "@/src/ui/text-field";
import numeral from "numeral";
import type { NamedCampaign } from "@/src/hooks/useCampaign";
import dayjs from "dayjs";
import { Status } from "@metrom-xyz/sdk";
import { Typography } from "@/src/ui/typography";
import { useMemo } from "react";

interface DetailsProps {
    campaign?: NamedCampaign;
    loading: boolean;
}

export function Details({ campaign, loading }: DetailsProps) {
    const t = useTranslations("campaignDetails.details");

    const detailsLoading = loading || !campaign;
    const campaignDuration = useMemo(
        () =>
            campaign &&
            dayjs.unix(campaign.from).to(dayjs.unix(campaign.to), true),
        [campaign],
    );

    return (
        <div className={styles.root}>
            <div>
                <TextField
                    boxed
                    variant="xl"
                    label={t("tvl")}
                    loading={detailsLoading}
                    value={numeral(campaign?.pool.tvl).format("($ 0.00 a)")}
                />
                <TextField
                    boxed
                    variant="xl"
                    label={t("status.text")}
                    loading={detailsLoading}
                    value={
                        <div className={styles.statusWrapper}>
                            <div className={styles.statusDot}>
                                <div
                                    className={
                                        campaign && styles[campaign.status]
                                    }
                                ></div>
                            </div>
                            <Typography weight="medium" variant="xl">
                                {t(`status.${campaign?.status}`)}
                            </Typography>
                        </div>
                    }
                />
            </div>
            <div>
                <TextField
                    boxed
                    variant="xl"
                    uppercase
                    label={t("startDate")}
                    loading={detailsLoading}
                    value={
                        campaign &&
                        dayjs.unix(campaign.from).format("DD/MMM/YY HH:mm")
                    }
                />
                <TextField
                    boxed
                    variant="xl"
                    uppercase
                    label={t("endDate")}
                    loading={detailsLoading}
                    value={
                        campaign &&
                        dayjs.unix(campaign.to).format("DD/MMM/YY HH:mm")
                    }
                />
                <TextField
                    boxed
                    variant="xl"
                    label={t("endsIn")}
                    loading={detailsLoading}
                    value={
                        campaign?.status === Status.Ended
                            ? "-"
                            : campaignDuration
                    }
                />
            </div>
        </div>
    );
}