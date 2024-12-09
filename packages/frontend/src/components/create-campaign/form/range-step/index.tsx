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
import { PriceRangeChart } from "@/src/components/price-range-chart";
import { type RangeSpecification } from "@metrom-xyz/sdk";
import classNames from "classnames";
import { usePrevious } from "react-use";

import styles from "./styles.module.css";

interface RangeStepProps {
    disabled?: boolean;
    rangeSpecification?: CampaignPayload["rangeSpecification"];
    onRangeChange: (range: CampaignPayloadPart) => void;
    onError: (errors: CampaignPayloadErrors) => void;
}

export function RangeStep({
    disabled,
    rangeSpecification,
    onRangeChange,
    onError,
}: RangeStepProps) {
    const t = useTranslations("newCampaign.form.range");
    const [open, setOpen] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [activeTokenIndex, setActiveTokenIndex] = useState<number>(0);

    const [lowerUsdTargetRaw, setLowerUsdTargetRaw] = useState<
        number | undefined
    >(rangeSpecification?.lowerUsdTarget);
    const [upperUsdTargetRaw, setUpperUsdTargetRaw] = useState<
        number | undefined
    >(rangeSpecification?.upperUsdTarget);

    const prevRangeSpecification = usePrevious(rangeSpecification);
    const chainId = useChainId();

    const unsavedChanges = useMemo(() => {
        if (!prevRangeSpecification) return true;

        // FIXME: we should have tick values in the spec, no?
        const {
            lowerUsdTarget: prevLowerTarget,
            upperUsdTarget: prevUpperTarget,
        } = prevRangeSpecification;

        return (
            prevLowerTarget !== lowerUsdTargetRaw ||
            prevUpperTarget !== upperUsdTargetRaw
        );
    }, [lowerUsdTargetRaw, prevRangeSpecification, upperUsdTargetRaw]);

    const newRangeSpecification: RangeSpecification | undefined =
        lowerUsdTargetRaw !== undefined && upperUsdTargetRaw !== undefined
            ? {
                  lowerUsdTarget: lowerUsdTargetRaw,
                  upperUsdTarget: upperUsdTargetRaw,
              }
            : undefined;

    useEffect(() => {
        setOpen(false);
    }, [chainId]);

    // this hooks is used to disable and close the step when
    // the range specification gets disabled, after the campaign creation
    useEffect(() => {
        if (enabled && !!prevRangeSpecification && !rangeSpecification)
            setEnabled(false);
    }, [enabled, prevRangeSpecification, rangeSpecification]);

    useEffect(() => {
        if (enabled) return;
        if (rangeSpecification)
            onRangeChange({ rangeSpecification: undefined });

        setLowerUsdTargetRaw(undefined);
        setUpperUsdTargetRaw(undefined);
        setError("");
    }, [enabled, onRangeChange, rangeSpecification]);

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
            (lowerUsdTargetRaw >= upperUsdTargetRaw ||
                lowerUsdTargetRaw === upperUsdTargetRaw)
        )
            setError("errors.malformed");
        else setError("");
    }, [lowerUsdTargetRaw, upperUsdTargetRaw]);

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

    function handleTokenPriceOnFlip() {
        if (activeTokenIndex === 0) setActiveTokenIndex(1);
        if (activeTokenIndex === 1) setActiveTokenIndex(0);

        setLowerUsdTargetRaw(undefined);
        setUpperUsdTargetRaw(undefined);
        onRangeChange({ rangeSpecification: undefined });
    }

    const handleOnApply = useCallback(() => {
        if (lowerUsdTargetRaw === undefined || upperUsdTargetRaw === undefined)
            return;

        const rangeSpecification: RangeSpecification = {
            lowerUsdTarget: lowerUsdTargetRaw,
            upperUsdTarget: upperUsdTargetRaw,
        };

        setOpen(false);
        onRangeChange({ rangeSpecification });
    }, [lowerUsdTargetRaw, onRangeChange, upperUsdTargetRaw]);

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
                        // TODO: use real tick spacing
                        error={!!error}
                        tickPriceSpacing={15}
                        rangeSpecification={newRangeSpecification}
                        onTokenPriceFlip={handleTokenPriceOnFlip}
                        onLowerUsdTargetChange={setLowerUsdTargetRaw}
                        onUpperUsdTargetChange={setUpperUsdTargetRaw}
                    />
                    <PriceRangeChart
                        error={!!error}
                        poolTick={40}
                        activeTokenIndex={activeTokenIndex}
                        lowerUsdPrice={lowerUsdTargetRaw}
                        upperUsdPrice={upperUsdTargetRaw}
                    />
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
