import classNames from "classnames";
import { Typography, Button, Skeleton } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import {
    useAccount,
    usePublicClient,
    useSimulateContract,
    useSwitchChain,
    useWriteContract,
} from "wagmi";
import { metromAbi } from "@metrom-xyz/contracts/abi";
import { useCallback, useState } from "react";
import type { TokenReimbursements } from "..";
import { toast } from "sonner";
import { useChainData } from "@/src/hooks/useChainData";
import { formatAmount } from "@/src/utils/format";
import { trackFathomEvent } from "@/src/utils/fathom";
import { RemoteLogo } from "@/src/components/remote-logo";
import type { WriteContractErrorType } from "viem";
import type { Erc20Token } from "@metrom-xyz/sdk";
import { RecoverSuccess } from "../../notification/recover-success";
import { RecoverFail } from "../../notification/recover-fail";

import styles from "./styles.module.css";

interface TokenReimbursementProps {
    chainId: number;
    tokenReimbursements: TokenReimbursements;
    disabled?: boolean;
    onRecover: (token: Erc20Token) => void;
}

export function TokenReimbursement({
    onRecover,
    chainId,
    tokenReimbursements,
    disabled,
}: TokenReimbursementProps) {
    const t = useTranslations("rewards.reimbursements");
    const { address: account } = useAccount();
    const publicClient = usePublicClient();
    const { switchChainAsync } = useSwitchChain();
    const { writeContractAsync } = useWriteContract();
    const chainData = useChainData(chainId);

    const [recovering, setRecovering] = useState(false);
    const [recovered, setRecovered] = useState(false);

    const {
        data: simulatedRecover,
        isLoading: simulatingRecover,
        isError: simulateRecoverErrored,
    } = useSimulateContract({
        chainId,
        abi: metromAbi,
        address: chainData?.metromContract.address,
        functionName: "recoverRewards",
        args: [
            !account
                ? []
                : tokenReimbursements.reimbursements.map((reimbursement) => {
                      return {
                          campaignId: reimbursement.campaignId,
                          proof: reimbursement.proof,
                          token: reimbursement.token.address,
                          amount: reimbursement.amount.raw,
                          receiver: account,
                      };
                  }),
        ],
        query: {
            refetchOnMount: false,
            enabled: !!account && tokenReimbursements.reimbursements.length > 0,
        },
    });

    const handleRecover = useCallback(() => {
        if (!writeContractAsync || !publicClient || !simulatedRecover?.request)
            return;
        const recover = async () => {
            setRecovering(true);
            try {
                await switchChainAsync({ chainId });

                const tx = await writeContractAsync(simulatedRecover.request);
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });

                if (receipt.status === "reverted") {
                    console.warn("Recover transaction reverted");
                    throw new Error("Transaction reverted");
                }

                toast.custom((toastId) => (
                    <RecoverSuccess
                        toastId={toastId}
                        chain={chainId}
                        token={tokenReimbursements.token}
                        amount={tokenReimbursements.totalAmount}
                    />
                ));
                setRecovered(true);
                onRecover(tokenReimbursements.token);
                trackFathomEvent("CLICK_RECOVER_SINGLE");
            } catch (error) {
                if (
                    !(error as WriteContractErrorType).message.includes(
                        "User rejected",
                    )
                )
                    toast.custom((toastId) => (
                        <RecoverFail toastId={toastId} />
                    ));

                console.warn("Could not recover", error);
            } finally {
                setRecovering(false);
            }
        };
        void recover();
    }, [
        chainId,
        publicClient,
        simulatedRecover,
        tokenReimbursements.token,
        tokenReimbursements.totalAmount,
        onRecover,
        switchChainAsync,
        writeContractAsync,
    ]);

    return (
        <div className={styles.root}>
            <div className={styles.leftWrapper}>
                <RemoteLogo
                    chain={chainId}
                    address={tokenReimbursements.token.address}
                    defaultText={tokenReimbursements.token.symbol}
                />
                <Typography size="lg" weight="medium">
                    {tokenReimbursements.token.symbol}
                </Typography>
                <Typography size="lg" weight="medium">
                    {formatAmount({
                        amount: tokenReimbursements.totalAmount,
                    })}
                </Typography>
            </div>
            <Button
                variant="secondary"
                size="sm"
                disabled={simulateRecoverErrored || recovered || disabled}
                loading={simulatingRecover || recovering}
                iconPlacement="right"
                onClick={handleRecover}
            >
                {simulatingRecover
                    ? t("loading")
                    : recovering
                      ? t("recoveringByToken", {
                            tokenSymbol: tokenReimbursements.token.symbol,
                        })
                      : t("recoverByToken", {
                            tokenSymbol: tokenReimbursements.token.symbol,
                        })}
            </Button>
        </div>
    );
}

export function SkeletonTokenReimbursement() {
    return (
        <div className={classNames(styles.root)}>
            <div className={styles.leftWrapper}>
                <RemoteLogo loading />
                <Skeleton width={60} size="lg" />
                <Skeleton width={70} size="lg" />
            </div>
            <Button variant="secondary" size="sm" loading />
        </div>
    );
}
