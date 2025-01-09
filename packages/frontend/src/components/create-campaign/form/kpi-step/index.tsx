import { Step } from "@/src/components/step";
import { StepContent } from "@/src/components/step/content";
import { StepPreview } from "@/src/components/step/preview";
import type {
    CampaignPayload,
    CampaignPayloadErrors,
    CampaignPayloadPart,
} from "@/src/types";
import { Button, ErrorText, Switch, Typography } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUsdAmount } from "@/src/utils/format";
import classNames from "classnames";
import { KpiMetric, type KpiSpecification } from "@metrom-xyz/sdk";
import { usePrevious } from "react-use";
import { KpiSimulationChart } from "../../../kpi-simulation-chart";
import { GoalInputs } from "./goal-inputs";
import { useChainId } from "wagmi";

import styles from "./styles.module.css";

interface KpiStepProps {
    disabled?: boolean;
    pool?: CampaignPayload["pool"];
    rewards?: CampaignPayload["tokens"];
    kpiSpecification?: CampaignPayload["kpiSpecification"];
    onKpiChange: (kpi: CampaignPayloadPart) => void;
    onError: (errors: CampaignPayloadErrors) => void;
}

export function KpiStep({
    disabled,
    pool,
    rewards,
    kpiSpecification,
    onKpiChange,
    onError,
}: KpiStepProps) {
    const t = useTranslations("newCampaign.form.kpi");
    const [open, setOpen] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");

    const [minimumPayoutPercentage, setMinimumPayoutPercentage] =
        useState<number>(kpiSpecification?.minimumPayoutPercentage || 0);
    const [lowerUsdTargetRaw, setLowerUsdTargetRaw] = useState<
        number | undefined
    >(kpiSpecification?.goal.lowerUsdTarget);
    const [upperUsdTargetRaw, setUpperUsdTargetRaw] = useState<
        number | undefined
    >(kpiSpecification?.goal.upperUsdTarget);

    const prevKpiSpecification = usePrevious(kpiSpecification);
    const chainId = useChainId();

    const totalRewardsUsdAmount = useMemo(() => {
        if (!rewards) return 0;
        let total = 0;
        for (const reward of rewards) {
            if (!reward.amount.usdValue) return 0;
            total += reward.amount.usdValue;
        }
        return total;
    }, [rewards]);

    const unsavedChanges = useMemo(() => {
        if (!prevKpiSpecification) return true;

        const {
            minimumPayoutPercentage: prevMinPayout = 0,
            goal: {
                lowerUsdTarget: prevLowerTarget,
                upperUsdTarget: prevUpperTarget,
            },
        } = prevKpiSpecification;

        return (
            prevMinPayout !== minimumPayoutPercentage ||
            prevLowerTarget !== lowerUsdTargetRaw ||
            prevUpperTarget !== upperUsdTargetRaw
        );
    }, [
        lowerUsdTargetRaw,
        minimumPayoutPercentage,
        prevKpiSpecification,
        upperUsdTargetRaw,
    ]);

    const newKpiSpecification: KpiSpecification | undefined =
        lowerUsdTargetRaw !== undefined && upperUsdTargetRaw !== undefined
            ? {
                  goal: {
                      metric: KpiMetric.RangePoolTvl,
                      lowerUsdTarget: lowerUsdTargetRaw,
                      upperUsdTarget: upperUsdTargetRaw,
                  },
                  minimumPayoutPercentage,
              }
            : undefined;

    useEffect(() => {
        setEnabled(false);
    }, [chainId]);

    // this hooks is used to disable and close the step when
    // the kpi specification gets disabled, after the campaign creation
    useEffect(() => {
        if (enabled && !!prevKpiSpecification && !kpiSpecification)
            setEnabled(false);
    }, [enabled, kpiSpecification, prevKpiSpecification]);

    useEffect(() => {
        if (enabled) return;
        if (kpiSpecification) onKpiChange({ kpiSpecification: undefined });

        setMinimumPayoutPercentage(0);
        setLowerUsdTargetRaw(undefined);
        setUpperUsdTargetRaw(undefined);
        setError("");
    }, [enabled, kpiSpecification, onKpiChange]);

    useEffect(() => {
        if (
            lowerUsdTargetRaw === undefined &&
            upperUsdTargetRaw === undefined
        ) {
            setError("");
            return;
        }

        if (
            (lowerUsdTargetRaw === undefined && upperUsdTargetRaw) ||
            (upperUsdTargetRaw === undefined && lowerUsdTargetRaw)
        ) {
            setError("errors.missing");
            return;
        }

        if (
            lowerUsdTargetRaw !== undefined &&
            upperUsdTargetRaw !== undefined &&
            lowerUsdTargetRaw >= upperUsdTargetRaw
        )
            setError("errors.malformed");
        else setError("");
    }, [lowerUsdTargetRaw, upperUsdTargetRaw]);

    useEffect(() => {
        if (enabled && !open && unsavedChanges)
            setWarning("warnings.notApplied");
        else setWarning("");
    }, [enabled, open, unsavedChanges]);

    useEffect(() => {
        onError({
            kpiSpecification: !!error || (enabled && !kpiSpecification),
        });
    }, [error, enabled, kpiSpecification, onError]);

    useEffect(() => {
        setOpen(enabled);
    }, [enabled]);

    function handleSwitchOnClick() {
        setEnabled((enabled) => !enabled);
    }

    function handleStepOnClick() {
        if (!enabled) return;
        setOpen((open) => !open);
    }

    const handleOnApply = useCallback(() => {
        if (lowerUsdTargetRaw === undefined || upperUsdTargetRaw === undefined)
            return;

        const kpiSpecification: KpiSpecification = {
            goal: {
                metric: KpiMetric.RangePoolTvl,
                lowerUsdTarget: lowerUsdTargetRaw,
                upperUsdTarget: upperUsdTargetRaw,
            },
        };

        if (minimumPayoutPercentage)
            kpiSpecification.minimumPayoutPercentage = minimumPayoutPercentage;

        setOpen(false);
        onKpiChange({ kpiSpecification });
    }, [
        lowerUsdTargetRaw,
        minimumPayoutPercentage,
        onKpiChange,
        upperUsdTargetRaw,
    ]);

    return (
        <Step
            disabled={disabled}
            error={!!error || !!warning}
            errorLevel={!!error ? "error" : "warning"}
            completed={enabled}
            open={open}
            onPreviewClick={handleStepOnClick}
            className={styles.step}
        >
            <StepPreview
                label={
                    <div className={styles.previewLabelWrapper}>
                        <div className={styles.previewTextWrapper}>
                            <Typography
                                uppercase
                                weight="medium"
                                className={styles.previewLabel}
                            >
                                {t("title")}
                            </Typography>
                            <ErrorText
                                size="xs"
                                weight="medium"
                                level={!!error ? "error" : "warning"}
                                className={classNames(styles.error, {
                                    [styles.errorVisible]: !!error || !!warning,
                                })}
                            >
                                {!!error
                                    ? t(error)
                                    : !!warning
                                      ? t(warning)
                                      : null}
                            </ErrorText>
                        </div>
                        <Switch
                            tabIndex={-1}
                            size="lg"
                            checked={enabled}
                            onClick={handleSwitchOnClick}
                        />
                    </div>
                }
                decorator={false}
                className={{
                    root: !enabled ? styles.previewDisabled : "",
                }}
            >
                <div className={styles.tvlWrapper}>
                    <Typography uppercase weight="medium" light size="sm">
                        {t("currentTvl")}
                    </Typography>
                    <Typography weight="medium" size="sm">
                        {formatUsdAmount(pool?.usdTvl)}
                    </Typography>
                </div>
            </StepPreview>
            <StepContent>
                <div className={styles.stepContent}>
                    <GoalInputs
                        kpiSpecification={newKpiSpecification}
                        error={!!error}
                        onLowerUsdTargetChange={setLowerUsdTargetRaw}
                        onUpperUsdTargetChange={setUpperUsdTargetRaw}
                        onMinimumPayoutPercentageChange={
                            setMinimumPayoutPercentage
                        }
                    />
                    <div className={styles.chartWrapper}>
                        <div className={styles.simulationTitleWrapper}>
                            <Typography
                                uppercase
                                weight="medium"
                                light
                                size="xs"
                            >
                                {t("simulation.title")}
                            </Typography>
                            <Typography weight="medium" light size="xs">
                                {t("simulation.description")}
                            </Typography>
                        </div>
                        <KpiSimulationChart
                            tooltipSize="xs"
                            lowerUsdTarget={lowerUsdTargetRaw}
                            upperUsdTarget={upperUsdTargetRaw}
                            totalRewardsUsd={totalRewardsUsdAmount}
                            minimumPayoutPercentage={minimumPayoutPercentage}
                            poolUsdTvl={pool?.usdTvl}
                            error={!!error}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={
                            !unsavedChanges ||
                            upperUsdTargetRaw === undefined ||
                            lowerUsdTargetRaw === undefined ||
                            !!error
                        }
                        onClick={handleOnApply}
                        className={{ root: styles.applyButton }}
                    >
                        {t("apply")}
                    </Button>
                </div>
            </StepContent>
        </Step>
    );
}
