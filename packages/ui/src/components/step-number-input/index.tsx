import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { BaseInputProps } from "../commons/input";
import { BaseInputWrapper } from "../commons/input";
import classNames from "classnames";
import { Button } from "../button";
import {
    NumberFormatBase,
    useNumericFormat,
    type NumberFormatValues,
    type NumericFormatProps,
} from "react-number-format";
import { Minus } from "../../assets/minus";
import { Plus } from "../../assets/plus";

import styles from "./styles.module.css";
import commonStyles from "../commons/styles.module.css";

export type StepNumberInputProps = Omit<
    NumericFormatProps & BaseInputProps<string>,
    "id" | "size" | "value" | "icon" | "iconPlacement"
> & {
    id?: string;
    size?: BaseInputProps<string>["size"];
    value?: string;
    forceStep?: boolean;
    onValueChange: (value: NumberFormatValues) => void;
};

// TODO: better way to handle steps with number input?
export const StepNumberInput = forwardRef<
    HTMLInputElement,
    StepNumberInputProps
>(function StepNumberInput(
    {
        id,
        label,
        size = "base",
        errorText,
        error = false,
        value,
        forceStep = false,
        step,
        loading,
        disabled,
        allowNegative,
        onValueChange,
        onBlur,
        className,
        ...rest
    },
    ref,
): ReactElement {
    const [rawValue, setRawValue] = useState<string>(value || "");
    const generatedId = useId();
    const internalRef = useRef<HTMLInputElement>(null);
    const { format, ...formatBaseProps } = useNumericFormat({
        type: "text",
        thousandSeparator: " ",
        decimalSeparator: ".",
        value,
        allowNegative,
        ...rest,
    });

    useEffect(() => {
        if (!format) return;

        onValueChange({
            value: rawValue,
            floatValue: isNaN(parseFloat(rawValue))
                ? undefined
                : parseFloat(rawValue),
            formattedValue: format(rawValue),
        });
    }, [rawValue]);

    function handleOnStepDown() {
        internalRef.current?.stepDown();

        const event = new Event("change", { bubbles: true });
        internalRef.current?.dispatchEvent(event);
    }

    function handleOnStepUp() {
        internalRef.current?.stepUp();

        const event = new Event("change", { bubbles: true });
        internalRef.current?.dispatchEvent(event);
    }

    function handleOnKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") handleOnStepDown();
        if (event.key === "ArrowUp") handleOnStepUp();
    }

    function handleOnBlur(event: React.FocusEvent<HTMLInputElement>) {
        if (onBlur) onBlur(event);
        if (step && forceStep && !!rawValue) {
            const normalized =
                Math.round(Number(rawValue) / Number(step)) * Number(step);
            setRawValue(normalized.toString());
        }
    }

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        const rawValue = event.target.value;

        if (allowNegative === false && Number(rawValue) < 0) return;
        setRawValue(rawValue);
    }

    function handleFormattedOnChange(event: ChangeEvent<HTMLInputElement>) {
        const rawValue = event.target.value.replace(/[^0-9,.\\+\\-]/g, "");
        setRawValue(rawValue ? rawValue : "");
    }

    const resolvedId = id || generatedId;

    return (
        <BaseInputWrapper
            id={resolvedId}
            label={label}
            size={size}
            loading={loading}
            error={error}
            errorText={errorText}
            className={className}
        >
            <div className={styles.wrapper}>
                <Button
                    variant="secondary"
                    size="xs"
                    icon={Minus}
                    onClick={handleOnStepDown}
                    className={{
                        root: classNames(
                            styles.stepButton,
                            styles.stepDownButton,
                        ),
                    }}
                />
                <NumberFormatBase
                    id={resolvedId}
                    getInputRef={ref}
                    format={format}
                    disabled={disabled || loading}
                    {...formatBaseProps}
                    onChange={handleFormattedOnChange}
                    onKeyDown={handleOnKeyDown}
                    onBlur={handleOnBlur}
                    onValueChange={onValueChange}
                    className={classNames("input", commonStyles.input)}
                />
                <input
                    ref={internalRef}
                    type="number"
                    step={step}
                    value={rawValue}
                    onChange={handleOnChange}
                    className={styles.hiddenInput}
                />
                <Button
                    variant="secondary"
                    size="xs"
                    icon={Plus}
                    onClick={handleOnStepUp}
                    className={{
                        root: classNames(
                            styles.stepButton,
                            styles.stepUpButton,
                        ),
                    }}
                />
            </div>
        </BaseInputWrapper>
    );
});
