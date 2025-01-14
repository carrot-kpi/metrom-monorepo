import { forwardRef, useId, useRef } from "react";
import type { ReactElement } from "react";
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
    "id" | "size" | "value" | "icon" | "iconPlacement" | "onChange"
> & {
    id?: string;
    size?: BaseInputProps<string>["size"];
    value?: number;
    onChange: (value: number | undefined) => void;
    onIncrement: () => void;
    onDecrement: () => void;
};

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
        loading,
        disabled,
        allowNegative,
        onChange,
        onIncrement,
        onDecrement,
        onBlur,
        className,
        ...rest
    },
    ref,
): ReactElement {
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

    function handleOnKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") onDecrement();
        if (event.key === "ArrowUp") onIncrement();
    }

    function handleOnValueChange(values: NumberFormatValues) {
        onChange(values.floatValue);
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
                    disabled={disabled || loading}
                    onClick={onDecrement}
                    className={{
                        root: classNames(
                            styles.stepButton,
                            styles.stepDownButton,
                        ),
                    }}
                />
                <NumberFormatBase
                    id={resolvedId}
                    format={format}
                    getInputRef={ref}
                    {...formatBaseProps}
                    onValueChange={handleOnValueChange}
                    onKeyDown={handleOnKeyDown}
                    onBlur={onBlur}
                    className={classNames("input", commonStyles.input)}
                />
                <input
                    ref={internalRef}
                    type="number"
                    value={value}
                    disabled={disabled || loading}
                    className={styles.hiddenInput}
                />
                <Button
                    variant="secondary"
                    size="xs"
                    icon={Plus}
                    disabled={disabled || loading}
                    onClick={onIncrement}
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
