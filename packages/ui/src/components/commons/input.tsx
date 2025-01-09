import React from "react";
import type {
    ChangeEventHandler,
    FunctionComponent,
    InputHTMLAttributes,
    ReactElement,
} from "react";
import classNames from "classnames";
import { Typography } from "../typography";
import { ErrorText } from "../error-text";

import styles from "./styles.module.css";

export type BaseInputSize = "xs" | "sm" | "base" | "lg";

export interface PartialBaseInputProps<V> {
    error?: boolean;
    errorText?: string;
    size?: BaseInputSize;
    placeholder?: string;
    loading?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    value?: V;
    border?: boolean;
}

export type BaseInputProps<V> = PartialBaseInputProps<V> &
    Omit<BaseInputWrapperProps, "children"> &
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        keyof PartialBaseInputProps<V> | keyof BaseInputWrapperProps | "ref"
    >;

export interface BaseInputWrapperProps {
    id: string;
    label?: string;
    size?: BaseInputSize;
    loading?: boolean;
    error?: boolean;
    border?: boolean;
    errorText?: string;
    icon?: FunctionComponent<React.SVGProps<SVGSVGElement>>;
    iconPlacement?: "left" | "right";
    className?: string;
    children: ReactElement;
}

export const BaseInputWrapper = ({
    id,
    label,
    size = "base",
    loading,
    error,
    errorText,
    icon: Icon,
    iconPlacement = "right",
    className,
    children,
}: BaseInputWrapperProps): ReactElement => {
    const icon = Icon && (
        <div
            className={classNames("inputIconWrapper", styles.inputIconWrapper, {
                [styles.placeLeft]: iconPlacement === "left",
                [styles.placeRight]: iconPlacement === "right",
            })}
        >
            <Icon
                className={classNames("inputIcon", styles.inputIcon, {
                    [styles[size]]: true,
                })}
            />
        </div>
    );

    return (
        <div
            className={classNames("root", className, {
                [styles[size]]: true,
                [styles.hasLeftIcon]: !!icon && iconPlacement === "left",
                [styles.hasRightIcon]: !!icon && iconPlacement === "right",
            })}
        >
            {!!label && (
                <label
                    className={classNames("label", styles.label)}
                    htmlFor={id}
                >
                    <Typography
                        uppercase
                        size="xs"
                        weight="medium"
                        light
                        className="labelText"
                    >
                        {label}
                    </Typography>
                </label>
            )}
            <div className={classNames("inputWrapper", styles.inputWrapper)}>
                {iconPlacement === "left" && icon}
                {React.cloneElement(children, {
                    className: classNames(children.props.className, {
                        [styles.inputError]: !!error,
                        [styles.inputLoading]: !!loading,
                    }),
                })}
                {iconPlacement === "right" && icon}
            </div>
            {error && errorText && (
                <ErrorText
                    size="xs"
                    weight="medium"
                    className={styles.errorText}
                >
                    {errorText}
                </ErrorText>
            )}
        </div>
    );
};
