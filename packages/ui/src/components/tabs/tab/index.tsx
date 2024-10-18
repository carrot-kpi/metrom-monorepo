import type { ReactNode } from "react";
import classNames from "classnames";

import styles from "./styles.module.css";

export interface TabProps<T> {
    onClick?: (value: T) => void;
    active?: T;
    value: T;
    children?: ReactNode;
    className?: string;
}

export function Tab<T>({
    onClick,
    active,
    value,
    children,
    className,
}: TabProps<T>) {
    function handleOnClick() {
        if (onClick) onClick(value);
    }

    return (
        <div
            className={classNames(styles.root, className, {
                [styles.active]: value === active,
            })}
            onClick={handleOnClick}
        >
            {children}
        </div>
    );
}