import { useCallback, useEffect, useMemo, useState } from "react";
import { Typography, ErrorText, Tabs, Tab } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import { Step } from "@/src/components/step";
import { StepPreview } from "@/src/components/step/preview";
import { StepContent } from "@/src/components/step/content";
import {
    type CampaignPayload,
    type CampaignPayloadPart,
    type CampaignPayloadErrors,
    RewardType,
} from "@/src/types";
import classNames from "classnames";
import { RewardTokens } from "./tokens";
import { RewardPoints } from "./points";

import styles from "./styles.module.css";

interface RewardsStepProps {
    disabled?: boolean;
    pool?: CampaignPayload["pool"];
    rewardType?: CampaignPayload["rewardType"];
    tokens?: CampaignPayload["tokens"];
    points?: CampaignPayload["points"];
    feeToken?: CampaignPayload["feeToken"];
    startDate?: CampaignPayload["startDate"];
    endDate?: CampaignPayload["endDate"];
    onRewardsChange: (rewards: CampaignPayloadPart) => void;
    onError: (errors: CampaignPayloadErrors) => void;
}

export function RewardsStep({
    disabled,
    pool,
    rewardType,
    tokens,
    points,
    feeToken,
    startDate,
    endDate,
    onRewardsChange,
    onError,
}: RewardsStepProps) {
    const t = useTranslations("newCampaign.form.rewards");
    const [type, setType] = useState(rewardType || RewardType.Tokens);
    const [error, setError] = useState("");

    const campaignDuration = useMemo(() => {
        if (!startDate || !endDate) return undefined;
        return endDate.diff(startDate, "seconds");
    }, [endDate, startDate]);

    const handleOnError = useCallback(
        (errors: CampaignPayloadErrors, message?: string) => {
            onError(errors);
            setError(message || "");
        },
        [onError],
    );

    useEffect(() => {
        if (rewardType) return;
        onRewardsChange({ rewardType: RewardType.Tokens });
    }, [rewardType, onRewardsChange]);

    useEffect(() => {
        if (pool) return;
        setType(RewardType.Tokens);
    }, [pool]);

    const handleOnRewardTypeSwitch = useCallback(
        (type: RewardType) => {
            setType(type);
            onRewardsChange({
                rewardType: type,
                tokens: undefined,
                points: undefined,
                feeToken: undefined,
            });
        },
        [onRewardsChange],
    );

    return (
        <Step
            disabled={disabled}
            completed={!disabled}
            error={!!error}
            className={styles.step}
        >
            <StepPreview
                label={
                    <div
                        className={classNames(styles.previewLabelWrapper, {
                            [styles.disabled]: disabled,
                        })}
                    >
                        <div className={styles.previewTextWrapper}>
                            <Typography
                                uppercase
                                weight="medium"
                                size="sm"
                                className={styles.previewLabel}
                            >
                                {t("title.rewards")}
                            </Typography>
                            {!disabled && (
                                <ErrorText
                                    size="xs"
                                    weight="medium"
                                    className={classNames(styles.error, {
                                        [styles.errorVisible]: !!error,
                                    })}
                                >
                                    {error}
                                </ErrorText>
                            )}
                        </div>
                        <Tabs
                            size="sm"
                            value={type}
                            onChange={handleOnRewardTypeSwitch}
                        >
                            <Tab
                                value={RewardType.Tokens}
                                className={classNames(styles.tab, {
                                    [styles.activeTab]:
                                        type === RewardType.Tokens,
                                })}
                            >
                                <Typography weight="medium" size="sm">
                                    {t("tabs.tokens")}
                                </Typography>
                            </Tab>
                            <Tab
                                value={RewardType.Points}
                                className={classNames(styles.tab, {
                                    [styles.activeTab]:
                                        type === RewardType.Points,
                                })}
                            >
                                <Typography weight="medium" size="sm">
                                    {t("tabs.points")}
                                </Typography>
                            </Tab>
                        </Tabs>
                    </div>
                }
                decorator={false}
                className={{ root: !disabled ? styles.stepPreview : "" }}
            >
                <div className={styles.previewWrapper}>
                    {type === RewardType.Points && (
                        <RewardPoints
                            campaignDuration={campaignDuration}
                            points={points}
                            feeToken={feeToken}
                            onError={handleOnError}
                            onPointsChange={onRewardsChange}
                        />
                    )}
                    {type === RewardType.Tokens && (
                        <RewardTokens
                            campaignDuration={campaignDuration}
                            tokens={tokens}
                            onError={handleOnError}
                            onTokensChange={onRewardsChange}
                        />
                    )}
                </div>
            </StepPreview>
            <StepContent></StepContent>
        </Step>
    );
}
