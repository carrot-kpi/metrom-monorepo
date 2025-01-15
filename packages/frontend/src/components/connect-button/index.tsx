import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Typography, Button, Popover } from "@metrom-xyz/ui";
import type { SupportedChain } from "@metrom-xyz/contracts";
import { useClickAway, useWindowSize } from "react-use";
import { useRef, useState, useEffect } from "react";
import {
    useChainId,
    useChains,
    useSwitchChain,
    useConnectors,
    useConnect,
    useAccount,
    useDisconnect,
} from "wagmi";
import { useTranslations } from "next-intl";
import { ErrorIcon } from "@/src/assets/error-icon";
import { blo, type Address } from "blo";
import { AccountMenu } from "./account-menu";
import { zeroAddress } from "viem";
import classNames from "classnames";
import { CHAIN_DATA, SAFE_CONNECTOR_ID } from "@/src/commons";
import { trackFathomEvent } from "@/src/utils/fathom";
import { useTransition, animated, easings } from "@react-spring/web";
import { SafeLogo } from "@/src/assets/logos/safe";
import { SAFE } from "@/src/commons/env";
import { toast } from "sonner";
import { SafeConnectedNotification } from "./safe-connected-notification";

import styles from "./styles.module.css";

export function ConnectButton() {
    const t = useTranslations();
    const chains = useChains();
    const currentChainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { width } = useWindowSize();
    const connectors = useConnectors();
    const { connector } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    const [networkWrapper, setNetworkWrapper] = useState<HTMLDivElement | null>(
        null,
    );
    const [networkPopoverOpen, setNetworkPopoverOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const networksPopoverRef = useRef<HTMLDivElement>(null);

    const transitionHorizontal = useTransition(accountMenuOpen, {
        from: { transform: "translateX(448px)" },
        enter: { transform: "translateX(-448px)" },
        leave: { transform: "translateX(448px)" },
        config: { duration: 200, easing: easings.easeInOutCubic },
    });

    const transitionVertical = useTransition(accountMenuOpen, {
        from: { transform: "translateY(448px)" },
        enter: { transform: "translateY(-448px)" },
        leave: { transform: "translateY(448px)" },
        config: { duration: 200, easing: easings.easeInOutCubic },
    });

    useEffect(() => {
        if (!SAFE) return;

        const safeConnector = connectors.find(
            (connector) => connector.id === SAFE_CONNECTOR_ID,
        );
        if (!safeConnector) return;

        if (connector?.id !== SAFE_CONNECTOR_ID) disconnect();

        connect(
            { connector: safeConnector },
            {
                onSuccess: () =>
                    toast.custom((toastId) => (
                        <SafeConnectedNotification toastId={toastId} />
                    )),
                onError: (error) => {
                    console.warn(
                        `Could not connect with Safe connector: ${error}`,
                    );
                },
            },
        );
    }, [connect, connector?.id, connectors, disconnect]);

    function handleOpenNetworkPopover() {
        setNetworkPopoverOpen((prev) => !prev);
    }

    useClickAway(networksPopoverRef, () => {
        setNetworkPopoverOpen(false);
    });

    function getSwitchChainHandler(chainId: number) {
        return () => {
            switchChain(
                { chainId },
                {
                    onError: (err) => {
                        console.error(`Could not switch chain: ${err}`);
                    },
                },
            );
            setNetworkPopoverOpen(false);
        };
    }

    function handleAccountMenuOpen() {
        setAccountMenuOpen(true);
        trackFathomEvent("OPEN_SIDEBAR");
    }

    function handleAccountMenuClose() {
        setAccountMenuOpen(false);
    }

    return (
        <RainbowConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                const blockie = blo(
                    (account?.address as Address) || zeroAddress,
                );
                const ChainIcon =
                    CHAIN_DATA[currentChainId as SupportedChain].icon;

                return (
                    <div className={styles.root}>
                        <div className={styles.wrapper}>
                            <div ref={networksPopoverRef}>
                                <div
                                    ref={setNetworkWrapper}
                                    className={classNames(
                                        styles.networkWrapper,
                                        {
                                            [styles.wrongNetwork]:
                                                chain?.unsupported,
                                        },
                                    )}
                                    onClick={handleOpenNetworkPopover}
                                >
                                    {chain?.unsupported ? (
                                        <ErrorIcon
                                            className={styles.networkIcon}
                                        />
                                    ) : (
                                        <ChainIcon
                                            className={styles.networkIcon}
                                        />
                                    )}
                                </div>
                                <Popover
                                    placement="bottom"
                                    anchor={networkWrapper}
                                    open={networkPopoverOpen}
                                >
                                    <div className={styles.networksWrapper}>
                                        {chains.map((chain) => {
                                            const ChainIcon =
                                                CHAIN_DATA[
                                                    chain.id as SupportedChain
                                                ].icon;

                                            return (
                                                <div
                                                    key={chain.id}
                                                    className={
                                                        styles.networkRow
                                                    }
                                                    onClick={getSwitchChainHandler(
                                                        chain.id,
                                                    )}
                                                >
                                                    <ChainIcon
                                                        className={
                                                            styles.networkIcon
                                                        }
                                                    />
                                                    <Typography>
                                                        {chain.name}
                                                    </Typography>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Popover>
                            </div>
                            {!connected ? (
                                <Button
                                    onClick={openConnectModal}
                                    type="button"
                                    className={{
                                        root: styles.connectButton,
                                    }}
                                >
                                    {t("navigation.connectWallet")}
                                </Button>
                            ) : (
                                <>
                                    <div
                                        className={classNames(styles.overlay, {
                                            [styles.overlayOpen]:
                                                accountMenuOpen,
                                        })}
                                    />
                                    {width > 640
                                        ? transitionHorizontal(
                                              (style, open) =>
                                                  open && (
                                                      <animated.div
                                                          style={style}
                                                          className={
                                                              styles.accountMenuHorizontal
                                                          }
                                                      >
                                                          <AccountMenu
                                                              account={account}
                                                              blockie={blockie}
                                                              chainId={chain.id}
                                                              onClose={
                                                                  handleAccountMenuClose
                                                              }
                                                          />
                                                      </animated.div>
                                                  ),
                                          )
                                        : transitionVertical(
                                              (style, open) =>
                                                  open && (
                                                      <animated.div
                                                          style={style}
                                                          className={
                                                              styles.accountMenuVertical
                                                          }
                                                      >
                                                          <AccountMenu
                                                              account={account}
                                                              blockie={blockie}
                                                              chainId={chain.id}
                                                              onClose={
                                                                  handleAccountMenuClose
                                                              }
                                                          />
                                                      </animated.div>
                                                  ),
                                          )}
                                    <div
                                        className={styles.walletWrapper}
                                        onClick={handleAccountMenuOpen}
                                    >
                                        <div className={styles.account}>
                                            {SAFE ? (
                                                <div
                                                    className={classNames(
                                                        styles.avatar,
                                                        styles.safeAvatar,
                                                    )}
                                                >
                                                    <SafeLogo
                                                        className={
                                                            styles.safeLogo
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    alt="Avatar"
                                                    src={
                                                        account.ensAvatar ||
                                                        blockie
                                                    }
                                                    className={styles.avatar}
                                                />
                                            )}
                                            <Typography>
                                                {account.ensName ||
                                                    account.displayName}
                                            </Typography>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            }}
        </RainbowConnectButton.Custom>
    );
}
