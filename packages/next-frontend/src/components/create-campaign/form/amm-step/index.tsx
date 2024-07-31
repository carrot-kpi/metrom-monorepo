import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Step } from "@/src/components/step";
import { StepPreview } from "@/src/components/step/preview";
import { StepContent } from "@/src/components/step/content";
import { useAvailableAmms } from "@/src/hooks/useAvailableAmms";
import classNames from "@/src/utils/classes";
import { Typography } from "@/src/ui/typography";
import type {
    AmmInfo,
    CampaignPayload,
    CampaignPayloadPart,
} from "@/src/types";

import styles from "./styles.module.css";

interface AmmStepProps {
    amm?: CampaignPayload["amm"];
    onAmmChange: (amm: CampaignPayloadPart) => void;
}

export function AmmStep({ amm, onAmmChange }: AmmStepProps) {
    const t = useTranslations("new_campaign.form.amm");
    const availableAmms = useAvailableAmms();

    const getAmmChangeHandler = useCallback(
        (newAmm: AmmInfo) => {
            return () => {
                if (amm && amm.slug === newAmm.slug) return;
                onAmmChange({ amm: newAmm });
            };
        },
        [amm, onAmmChange],
    );

    return (
        <Step closeBehavior="innerClick">
            <StepPreview completed={!!amm} label={t("title")}>
                {amm && (
                    <div className={styles.amm__preview}>
                        <div className={styles.logo}>
                            <amm.logo />
                        </div>
                        <Typography variant="lg" weight="medium">
                            {amm.name}
                        </Typography>
                    </div>
                )}
            </StepPreview>
            <StepContent>
                <div className={styles.amm__wrapper}>
                    {availableAmms.map((availableAmm) => (
                        <div
                            key={availableAmm.slug}
                            className={classNames(styles.amm__row, {
                                [styles.amm__row_selected]:
                                    amm?.slug === availableAmm.slug,
                            })}
                            onClick={getAmmChangeHandler(availableAmm)}
                        >
                            <div className={styles.logo}>
                                <availableAmm.logo />
                            </div>
                            <Typography variant="lg" weight="medium">
                                {availableAmm.name}
                            </Typography>
                        </div>
                    ))}
                </div>
            </StepContent>
        </Step>
    );
}
