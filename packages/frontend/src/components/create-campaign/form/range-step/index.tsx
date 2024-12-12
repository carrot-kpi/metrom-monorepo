import { Step } from "@/src/components/step";
import { StepContent } from "@/src/components/step/content";
import { StepPreview } from "@/src/components/step/preview";
import { Button, ErrorText, Switch, Typography } from "@metrom-xyz/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import { useTranslations } from "next-intl";
import { RangeInputs } from "./range-inputs";
import type {
    CampaignPayload,
    CampaignPayloadErrors,
    CampaignPayloadPart,
} from "@/src/types";
// import { PriceRangeChart } from "@/src/components/price-range-chart";
import { type PoolWithTvl, type RangeSpecification } from "@metrom-xyz/sdk";
import classNames from "classnames";
import { usePrevious } from "react-use";

import styles from "./styles.module.css";

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

    const [from, setFrom] = useState<number | undefined>(
        rangeSpecification?.from,
    );
    const [to, setTo] = useState<number | undefined>(rangeSpecification?.to);

    const prevRangeSpecification = usePrevious(rangeSpecification);
    const chainId = useChainId();

    const unsavedChanges = useMemo(() => {
        return (
            !prevRangeSpecification ||
            prevRangeSpecification.from !== from ||
            prevRangeSpecification.to !== to
        );
    }, [from, prevRangeSpecification, to]);

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
        if (from === undefined && to === undefined) setError("");
        else if ((from === undefined && to) || (to === undefined && from))
            setError("errors.missing");
        else if (from !== undefined && to !== undefined && from >= to)
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

        const rangeSpecification: RangeSpecification = {
            from,
            to,
        };

        setOpen(false);
        onRangeChange({ rangeSpecification });
    }, [from, onRangeChange, to]);

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
                <div className={styles.tvlWrapper}>
                    <Typography uppercase weight="medium" light size="sm">
                        {t("currentPrice")}
                    </Typography>
                    <Typography weight="medium" size="sm">
                        price
                    </Typography>
                </div>
            </StepPreview>
            <StepContent>
                <div className={styles.stepContent}>
                    <RangeInputs
                        pool={pool}
                        error={!!error}
                        from={from}
                        onFromChange={setFrom}
                        to={to}
                        onToChange={setTo}
                    />
                    {/*<PriceRangeChart
                        error={!!error}
                        poolTick={40}
                        activeTokenIndex={activeTokenIndex}
                        lowerUsdPrice={from}
                        upperUsdPrice={to}
                    />*/}
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
