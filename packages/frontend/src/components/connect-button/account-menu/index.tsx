import classNames from "classnames";
import { useClickAway } from "react-use";
import { useEffect, useRef, useState } from "react";
import { Typography } from "@metrom-xyz/ui";
import { shortenAddress } from "@/src/utils/address";
import { type Address } from "viem";
import { Disconnect } from "@/src/assets/disconnect";
import { Activities } from "./activities";
import { useDisconnect } from "wagmi";
import { useTranslations } from "next-intl";
import { TickIcon } from "@/src/assets/tick-icon";
import { LinkIcon } from "@/src/assets/link-icon";
import { SAFE } from "@/src/commons/env";
import { SafeLogo } from "@/src/assets/logos/safe";

import styles from "./styles.module.css";

interface AccountMenuProps {
    className?: string;
    chainId: number;
    account: {
        address: string;
        balanceDecimals?: number;
        balanceFormatted?: string;
        balanceSymbol?: string;
        displayBalance?: string;
        displayName: string;
        ensAvatar?: string;
        ensName?: string;
        hasPendingTransactions: boolean;
    };
    blockie: string;
    onClose: () => void;
}

enum Tab {
    Activity,
    Campaigns,
}

// TODO: finish this (add campaigns tab)
export function AccountMenu({
    className,
    chainId,
    onClose,
    account,
    blockie,
}: AccountMenuProps) {
    const t = useTranslations("accountMenu");
    const rootRef = useRef(null);
    const { disconnect } = useDisconnect();

    const [copied, setCopied] = useState(false);

    const handleCopyClick = () => {
        navigator.clipboard.writeText(account.address).then(() => {
            setCopied(true);
        });
    };

    useClickAway(rootRef, onClose);

    const [tab, setTab] = useState(Tab.Activity);

    function handleDisconnect() {
        onClose();
        disconnect();
    }

    function handleActivityClick() {
        setTab(Tab.Activity);
    }

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => setCopied(false), 1500);

        return () => clearTimeout(timeout);
    }, [copied]);

    return (
        <div className={classNames(styles.root, className)} ref={rootRef}>
            <div className={styles.headerWrapper}>
                <div
                    className={classNames(styles.accountContainer, {
                        [styles.copied]: copied,
                    })}
                    onClick={handleCopyClick}
                >
                    {SAFE ? (
                        <div
                            className={classNames(
                                styles.avatar,
                                styles.safeAvatar,
                            )}
                        >
                            <SafeLogo className={styles.safeLogo} />
                        </div>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt="Avatar"
                            src={account.ensAvatar || blockie}
                            className={styles.avatar}
                        />
                    )}
                    <Typography size="lg" weight="medium">
                        {shortenAddress(account.address as Address)}
                    </Typography>
                    <div className={styles.iconContainer}>
                        {copied ? (
                            <TickIcon className={styles.tickIcon} />
                        ) : (
                            <LinkIcon className={styles.copyIcon} />
                        )}
                    </div>
                </div>
                {!SAFE && (
                    <Disconnect
                        className={styles.disconnectIcon}
                        onClick={handleDisconnect}
                    />
                )}
            </div>
            <div className={styles.tabs}>
                <div
                    onClick={handleActivityClick}
                    className={classNames(styles.tab, {
                        [styles.tabActive]: tab === Tab.Activity,
                    })}
                >
                    <Typography>{t("tabs.activity")}</Typography>
                </div>
                {/* TODO: add once we have a proper design */}
                {/* <div
                    onClick={handleCampaignsClick}
                    className={classNames(styles.tab, {
                        [styles.tabActive]: tab === Tab.Campaigns,
                    })}
                >
                    <Typography>{t("tabs.campaigns")}</Typography>
                </div> */}
            </div>
            {tab === Tab.Activity && <Activities chainId={chainId} />}
        </div>
    );
}
