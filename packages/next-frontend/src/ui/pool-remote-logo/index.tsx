import styles from "./styles.module.css";
import { RemoteLogo, type RemoteLogoProps } from "../remote-logo";
import classNames from "@/src/utils/classes";

interface PoolRemoteLogoProps {
    size?: "sm" | "md" | "lg";
    chain?: number | string;
    token0?: Omit<RemoteLogoProps, "size" | "chain">;
    token1?: Omit<RemoteLogoProps, "size" | "chain">;
    className?: {
        root?: string;
    };
}

export function PoolRemoteLogo({
    size = "md",
    chain,
    token0,
    token1,
    className,
}: PoolRemoteLogoProps) {
    return (
        <div
            className={classNames(className?.root, styles.root, {
                [styles[size]]: true,
            })}
        >
            <RemoteLogo chain={chain} size={size} {...token1} defaultText=" " />
            <RemoteLogo chain={chain} size={size} {...token0} defaultText=" " />
        </div>
    );
}
