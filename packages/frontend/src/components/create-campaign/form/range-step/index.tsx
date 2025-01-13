import { Step } from "@/src/components/step";
import { StepContent } from "@/src/components/step/content";
import { StepPreview } from "@/src/components/step/preview";
import {
    Button,
    ErrorText,
    Skeleton,
    Switch,
    Typography,
} from "@metrom-xyz/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import { useTranslations } from "next-intl";
import { RangeInputs, type RangeBound } from "./range-inputs";
import type {
    CampaignPayload,
    CampaignPayloadErrors,
    CampaignPayloadPart,
    EnrichedRangeSpecification,
} from "@/src/types";
import { LiquidityDensityChart } from "@/src/components/liquidity-density-chart";
import { getPrice, type PoolWithTvl } from "@metrom-xyz/sdk";
import classNames from "classnames";
import { usePrevious } from "react-use";
import { useLiquidityDensity } from "@/src/hooks/useLiquidityDensity";
import { formatAmount } from "@/src/utils/format";

import styles from "./styles.module.css";

const PRICE_STEP_FACTOR = 0.01;

interface RangeStepProps {
    disabled?: boolean;
    pool?: PoolWithTvl;
    rangeSpecification?: CampaignPayload["rangeSpecification"];
    onRangeChange: (range: CampaignPayloadPart) => void;
    onError: (errors: CampaignPayloadErrors) => void;
}

export function RangeStep({
    disabled,
    pool,
    rangeSpecification,
    onRangeChange,
    onError,
}: RangeStepProps) {
    const t = useTranslations("newCampaign.form.range");
    const [open, setOpen] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");

    const [from, setFrom] = useState<RangeBound | undefined>(
        rangeSpecification?.from,
    );
    const [to, setTo] = useState<RangeBound | undefined>(
        rangeSpecification?.to,
    );

    const prevRangeSpecification = usePrevious(rangeSpecification);
    const chainId = useChainId();
    const { liquidityDensity, loading: loadingLiquidityDensity } =
        useLiquidityDensity(pool, chainId, enabled);

    const unsavedChanges = useMemo(() => {
        return (
            !prevRangeSpecification ||
            prevRangeSpecification.from !== from ||
            prevRangeSpecification.to !== to
        );
    }, [from, prevRangeSpecification, to]);

    const priceStep = useMemo(() => {
        if (!liquidityDensity || !pool) return undefined;
        return getPrice(liquidityDensity.activeIdx, pool) * PRICE_STEP_FACTOR;
    }, [liquidityDensity, pool]);

    useEffect(() => {
        setOpen(false);
    }, [chainId]);

    // this hooks is used to disable and close the step when
    // the range specification gets disabled, after the campaign creation
    useEffect(() => {
        if (enabled && !!prevRangeSpecification && !rangeSpecification)
            setEnabled(false);
    }, [enabled, prevRangeSpecification, rangeSpecification]);

    // reset state once the step gets disabled
    useEffect(() => {
        if (enabled) return;
        if (rangeSpecification)
            onRangeChange({ rangeSpecification: undefined });

        setFrom(undefined);
        setTo(undefined);
        setError("");
    }, [enabled, onRangeChange, rangeSpecification]);

    useEffect(() => {
        if (!from && !to) setError("");
        else if ((!from && to) || (!to && from)) setError("errors.missing");
        else if (!!from && !!to && from.price >= to.price)
            setError("errors.malformed");
        else setError("");
    }, [from, to]);

    useEffect(() => {
        setOpen(enabled);
    }, [enabled]);

    useEffect(() => {
        if (enabled && !open && unsavedChanges)
            setWarning("warnings.notApplied");
        else setWarning("");
    }, [enabled, open, unsavedChanges]);

    useEffect(() => {
        onError({
            rangeSpecification: !!error || (enabled && !rangeSpecification),
        });
    }, [error, enabled, rangeSpecification, onError]);

    function handleSwitchOnClick() {
        setEnabled((enabled) => !enabled);
    }

    function handleStepOnClick() {
        if (!enabled) return;
        setOpen((open) => !open);
    }

    const handleApply = useCallback(() => {
        if (from === undefined || to === undefined) return;

        const rangeSpecification: EnrichedRangeSpecification = {
            from,
            to,
        };

        setOpen(false);
        onRangeChange({ rangeSpecification });
    }, [from, to, onRangeChange]);

    return (
        <Step
            disabled={disabled}
            error={!!error || !!warning}
            errorLevel={!!error ? "error" : "warning"}
            completed={enabled}
            open={open}
            onPreviewClick={handleStepOnClick}
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
                    root: classNames({
                        [styles.previewDisabled]: !enabled,
                    }),
                }}
            >
                <div className={styles.priceWrapper}>
                    {open ||
                    from?.price === undefined ||
                    to?.price === undefined ? (
                        <>
                            <Typography
                                uppercase
                                weight="medium"
                                light
                                size="sm"
                            >
                                {t("currentPrice")}
                            </Typography>
                            {!liquidityDensity ||
                            !pool ||
                            loadingLiquidityDensity ? (
                                <Skeleton size="sm" width={50} />
                            ) : (
                                <Typography weight="medium" size="sm">
                                    {t("price", {
                                        token0: pool?.tokens[0].symbol,
                                        token1: pool?.tokens[1].symbol,
                                        price: formatAmount({
                                            amount: getPrice(
                                                liquidityDensity.activeIdx,
                                                pool,
                                            ),
                                        }),
                                    })}
                                </Typography>
                            )}
                        </>
                    ) : (
                        <>
                            <Typography
                                uppercase
                                weight="medium"
                                light
                                size="sm"
                            >
                                {t("range.label")}
                            </Typography>
                            <Typography weight="medium" size="sm">
                                {t("range.value", {
                                    token0: pool?.tokens[0].symbol,
                                    token1: pool?.tokens[1].symbol,
                                    lowerPrice: from?.price.toFixed(4),
                                    upperPrice: to?.price.toFixed(4),
                                })}
                            </Typography>
                        </>
                    )}
                </div>
            </StepPreview>
            <StepContent>
                <div className={styles.stepContent}>
                    <RangeInputs
                        pool={pool}
                        error={!!error}
                        priceStep={priceStep}
                        from={from?.price}
                        to={to?.price}
                        onFromChange={setFrom}
                        onToChange={setTo}
                    />
                    <div>
                        <Typography weight="medium" light uppercase size="xs">
                            {t("chart")}
                        </Typography>
                        <LiquidityDensityChart
                            error={!!error}
                            loading={loadingLiquidityDensity}
                            from={from?.tick}
                            to={to?.tick}
                            pool={pool}
                            liquidityDensity={liquidityDensity}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={
                            !unsavedChanges ||
                            to === undefined ||
                            from === undefined ||
                            !!error
                        }
                        onClick={handleApply}
                        className={{ root: styles.applyButton }}
                    >
                        {t("apply")}
                    </Button>
                </div>
            </StepContent>
        </Step>
    );
}
