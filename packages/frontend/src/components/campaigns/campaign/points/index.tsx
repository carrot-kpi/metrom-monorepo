import { Status, type OnChainAmount } from "@metrom-xyz/sdk";
import { Popover, Typography } from "@metrom-xyz/ui";
import { PointsIcon } from "@/src/assets/points-icon";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/src/utils/format";

import styles from "./syles.module.css";

interface PointsProps {
    status: Status;
    amount: OnChainAmount;
    daysDuration: number;
}

export function Points({ status, amount, daysDuration }: PointsProps) {
    const t = useTranslations("allCampaigns.points");

    const [popover, setPopover] = useState(false);
    const [breakdown, setBreakdown] = useState<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const perDayPoints =
        daysDuration >= 1 ? amount.formatted / daysDuration : 0;

    function handleBreakdownPopoverOpen() {
        setPopover(true);
    }

    function handleBreakdownPopoverClose() {
        setPopover(false);
    }

    return (
        <div className={styles.root}>
            <Popover
                open={popover}
                anchor={breakdown}
                ref={popoverRef}
                placement="top"
            >
                <div className={styles.breakdownContainer}>
                    <Typography size="sm" weight="medium" light uppercase>
                        {t("tooltip.points")}
                    </Typography>
                    <Typography size="lg" weight="medium">
                        {formatAmount({ amount: amount.formatted })}
                    </Typography>
                </div>
            </Popover>
            <div
                ref={setBreakdown}
                onMouseEnter={handleBreakdownPopoverOpen}
                onMouseLeave={handleBreakdownPopoverClose}
                className={styles.iconWrapper}
            >
                <PointsIcon className={styles.icon} />
            </div>
            <Typography weight="medium" className={styles.textPoints}>
                {status === Status.Ended
                    ? "-"
                    : formatAmount({ amount: perDayPoints })}
            </Typography>
        </div>
    );
}
