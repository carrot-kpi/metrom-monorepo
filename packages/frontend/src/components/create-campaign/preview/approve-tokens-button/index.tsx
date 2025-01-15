import { useTranslations } from "next-intl";
import { usePrevious } from "react-use";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@metrom-xyz/ui";
import { WalletIcon } from "@/src/assets/wallet-icon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { ApproveTokens } from "./approve-tokens";
import { useChainData } from "@/src/hooks/useChainData";
import type { BaseTransaction } from "@safe-global/safe-apps-sdk";
import type { WhitelistedErc20TokenAmount } from "@metrom-xyz/sdk";

import styles from "./styles.module.css";

interface ApproveTokensButtonProps {
    malformedPayload: boolean;
    tokens?: WhitelistedErc20TokenAmount[];
    onApproved: () => void;
    onSafeTx: (tx: BaseTransaction) => void;
}

export function ApproveTokensButton({
    malformedPayload,
    tokens,
    onApproved,
    onSafeTx,
}: ApproveTokensButtonProps) {
    const t = useTranslations("campaignPreview");
    const [approved, setApproved] = useState(false);

    const previousRewards = usePrevious(tokens);

    const chainId = useChainId();
    const { openConnectModal } = useConnectModal();
    const chainData = useChainData(chainId);
    const { address: connectedAddress } = useAccount();

    useEffect(() => {
        if (previousRewards && previousRewards.length !== tokens?.length)
            setApproved(false);
    }, [tokens?.length, previousRewards]);

    const handleOnApprove = useCallback(() => {
        setApproved(true);
        onApproved();
    }, [onApproved]);

    if (!connectedAddress)
        return (
            <Button
                icon={WalletIcon}
                iconPlacement="right"
                disabled={malformedPayload}
                className={{ root: styles.button }}
                onClick={openConnectModal}
            >
                {t("connectWallet")}
            </Button>
        );

    if (!approved && !!tokens && tokens.length > 0)
        return (
            <ApproveTokens
                onApprove={handleOnApprove}
                disabled={malformedPayload}
                rewards={tokens}
                spender={chainData?.metromContract.address}
                onSafeTx={onSafeTx}
            />
        );

    return null;
}
