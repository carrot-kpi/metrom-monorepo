import { forwardRef, useId } from "react";
import type { ReactElement } from "react";
import { type NumericFormatProps, NumericFormat } from "react-number-format";
import { type BaseInputProps, BaseInputWrapper } from "./commons/input";
import classNames from "classnames";

import styles from "./commons/styles.module.css";

export { type NumberFormatValues } from "react-number-format";

export type NumberInputProps = Omit<
    NumericFormatProps & BaseInputProps<string>,
    "size" | "id" | "className"
> & {
    id?: string;
    size?: BaseInputProps<string>["size"];
    className?: BaseInputProps<string>["className"];
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    function NumberInput(
        {
            id,
            size = "base",
            value,
            label,
            placeholder,
            errorText,
            icon,
            iconPlacement,
            error = false,
            className,
            loading,
            disabled,
            ...rest
        },
        ref,
    ): ReactElement {
        const generatedId = useId();

        const resolvedId = id || generatedId;

        return (
            <BaseInputWrapper
                id={resolvedId}
                label={label}
                size={size}
                loading={loading}
                error={error}
                errorText={errorText}
                icon={icon}
                iconPlacement={iconPlacement}
                className={className}
            >
                <NumericFormat
                    id={resolvedId}
                    type="text"
                    defaultValue=""
                    thousandSeparator=" "
                    decimalSeparator="."
                    value={value}
                    disabled={disabled || loading}
                    placeholder={placeholder}
                    getInputRef={ref}
                    {...rest}
                    className={classNames("input", styles.input)}
                />
            </BaseInputWrapper>
        );
    },
);
