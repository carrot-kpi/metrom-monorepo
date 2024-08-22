import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { Button } from "@/src/ui/button";
import { useAccount, useChainId } from "wagmi";
import { useTranslations } from "next-intl";
import type {
    Token,
    WhitelistedErc20Token,
    WhitelistedErc20TokenAmount,
} from "@metrom-xyz/sdk";
import { Step } from "@/src/components/step";
import { StepPreview } from "@/src/components/step/preview";
import { StepContent } from "@/src/components/step/content";
import type {
    CampaignPayload,
    CampaignPayloadPart,
    CampaignPayloadErrors,
} from "@/src/types";
import { RewardTokensList } from "./reward-tokens-list";
import { NumberInput, type NumberFormatValues } from "@/src/ui/number-input";
import { RemoteLogo } from "@/src/ui/remote-logo";
import { Typography } from "@/src/ui/typography";
import { PlusIcon } from "@/src/assets/plus-icon";
import { ChevronDownIcon } from "@/src/assets/chevron-down-icon";
import { RewardsPreview } from "./preview";
import { ErrorText } from "@/src/ui/error-text";
import { useWatchBalance } from "@/src/hooks/useWatchBalance";

import styles from "./styles.module.css";

interface RewardsStepProps {
    disabled?: boolean;
    rewards?: CampaignPayload["rewards"];
    startDate?: CampaignPayload["startDate"];
    endDate?: CampaignPayload["endDate"];
    onRewardsChange: (rewards: CampaignPayloadPart) => void;
    onError: (errors: CampaignPayloadErrors) => void;
}

export function RewardsStep({
    disabled,
    rewards,
    startDate,
    endDate,
    onRewardsChange,
    onError,
}: RewardsStepProps) {
    const t = useTranslations("newCampaign.form.rewards");
    const [open, setOpen] = useState(false);
    const [rewardAmount, setRewardAmount] = useState<number | undefined>();
    const [rewardToken, setRewardToken] = useState<WhitelistedErc20Token>();
    const [rewardAmountError, setRewardAmountError] = useState("");

    const { address } = useAccount();
    const chainId = useChainId();

    const { balance: rewardTokenBalance } = useWatchBalance(
        address,
        rewardToken?.address,
    );

    const campaignDuration = useMemo(() => {
        if (!startDate || !endDate) return undefined;
        return endDate.diff(startDate, "seconds");
    }, [endDate, startDate]);

    useEffect(() => {
        setOpen(false);
    }, [chainId]);

    useEffect(() => {
        if (disabled) return;
        setOpen(true);
    }, [disabled]);

    useEffect(() => {
        if (
            !rewardAmount ||
            rewardTokenBalance === undefined ||
            !campaignDuration ||
            !rewardToken
        )
            return;

        const distributionRate = (rewardAmount * 3_600) / campaignDuration;
        const balance = Number(
            formatUnits(rewardTokenBalance, rewardToken.decimals),
        );
        const minimumRate = Number(
            formatUnits(rewardToken.minimumRate, rewardToken.decimals),
        );

        const error =
            rewardAmount > balance
                ? "errors.insufficientBalance"
                : distributionRate < minimumRate
                  ? "errors.lowDistributionRate"
                  : "";

        onError({ rewards: !!error });
        setRewardAmountError(error);
    }, [
        campaignDuration,
        onError,
        rewardAmount,
        rewardToken,
        rewardTokenBalance,
    ]);

    function handleRewardTokenButtonOnClick() {
        setOpen((open) => !open);
    }

    const handleRewardAmountOnChange = useCallback(
        (rawNewAmount: NumberFormatValues) => {
            setRewardAmount(rawNewAmount.floatValue);
        },
        [],
    );

    const handleRewardTokenOnAdd = useCallback(() => {
        if (!rewardAmount || !rewardToken) return;

        const { address, decimals, name, symbol, minimumRate } = rewardToken;
        const reward: WhitelistedErc20TokenAmount = {
            token: { address, decimals, name, symbol },
            amount: rewardAmount,
            minimumRate,
        };
        const newRewards: CampaignPayload["rewards"] = rewards
            ? [...rewards, reward]
            : [reward];

        onRewardsChange({ rewards: newRewards });
        setRewardAmount(undefined);
        setRewardToken(undefined);
    }, [onRewardsChange, rewardAmount, rewardToken, rewards]);

    const handleRewardTokenOnRemove = useCallback(
        (token: Token) => {
            if (!rewards) return;

            onRewardsChange({
                rewards: rewards.filter(
                    (reward) => reward.token.address !== token.address,
                ),
            });
        },
        [onRewardsChange, rewards],
    );

    return (
        <Step
            disabled={disabled}
            open={open}
            completed={!disabled}
            error={!!rewardAmountError}
        >
            <StepPreview
                label={
                    <div className={styles.previewLabelWrapper}>
                        <Typography
                            uppercase
                            weight="medium"
                            variant="sm"
                            className={{ root: styles.previewLabel }}
                        >
                            {t("title")}
                        </Typography>
                        {rewardAmountError && (
                            <ErrorText variant="xs" weight="medium">
                                {t(rewardAmountError)}
                            </ErrorText>
                        )}
                    </div>
                }
                decorator={disabled}
                className={{ root: styles.stepPreview }}
            >
                <div className={styles.previewWrapper}>
                    {/* TODO: add balance validation to rewards added before connecting the wallet */}
                    <RewardsPreview
                        rewards={rewards}
                        campaignDuration={campaignDuration}
                        onRemove={handleRewardTokenOnRemove}
                    />
                    <div className={styles.rewardPickerWrapper}>
                        <NumberInput
                            placeholder="0"
                            value={rewardAmount ? rewardAmount.toString() : ""}
                            onValueChange={handleRewardAmountOnChange}
                            className={{
                                input: styles.rewardTokenAmountInput,
                                inputWrapper: styles.rewardTokenAmountInput,
                            }}
                        />
                        <div
                            className={styles.rewardTokenSelect}
                            onClick={handleRewardTokenButtonOnClick}
                        >
                            <RemoteLogo
                                size="xs"
                                address={rewardToken?.address}
                                chain={chainId}
                                defaultText=" "
                            />
                            <Typography weight="medium">
                                {rewardToken?.symbol}
                            </Typography>
                            <ChevronDownIcon />
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="xsmall"
                        icon={PlusIcon}
                        disabled={
                            rewards?.length === 5 ||
                            !rewardAmount ||
                            !rewardToken ||
                            !!rewardAmountError
                        }
                        onClick={handleRewardTokenOnAdd}
                        className={{
                            root: styles.addRewardButton,
                            contentWrapper: styles.addRewardButtonContent,
                            icon: styles.addRewardButtonIcon,
                        }}
                    >
                        {t("add")}
                    </Button>
                    <Typography uppercase variant="sm" weight="medium" light>
                        {t("totalUsd")}
                    </Typography>
                    <Typography uppercase weight="bold" light>
                        {/* TODO: usd amount */}$ 0
                    </Typography>
                </div>
            </StepPreview>
            <StepContent>
                <RewardTokensList
                    unavailable={rewards}
                    value={rewardToken}
                    onRewardTokenClick={setRewardToken}
                />
            </StepContent>
        </Step>
    );
}
