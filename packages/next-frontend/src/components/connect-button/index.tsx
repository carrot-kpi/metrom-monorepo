import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

import styles from "./styles.module.css";
import { WalletIcon } from "@/src/assets/wallet-icon";
import { SettingsIcon } from "@/src/assets/settings-icon";

// TODO: implement connect button
export function ConnectButton() {
    return (
        <RainbowConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div className={styles.root}>
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <div className={styles.wrapper}>
                                    <div className={styles.account}>
                                        <WalletIcon className={styles.icon} />
                                        {/* TODO: add typography */}
                                        {account.ensName || account.displayName}
                                    </div>
                                    {/* TODO: add icon button */}
                                    <div
                                        onClick={openAccountModal}
                                        className={styles.settings}
                                    >
                                        <SettingsIcon className={styles.icon} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowConnectButton.Custom>
    );
}