import { useCallback, useState } from "react";
import {
    useWriteContract,
    usePublicClient,
    useChainId,
    useSimulateContract,
} from "wagmi";
import { erc20Abi, type Address } from "viem";
import type { Erc20TokenAmount } from "@metrom-xyz/sdk";
import { Button } from "@metrom-xyz/ui";
import { useTranslations } from "next-intl";
import { RewardIcon } from "@/src/assets/reward-icon";

import styles from "./styles.module.css";
import { formatAmount } from "@/src/utils/format";

interface ApproveTokenProps {
    loading: boolean;
    disabled: boolean;
    reward: Erc20TokenAmount;
    index: number;
    totalAmount: number;
    spender?: Address;
    onApprove: () => void;
}

export function ApproveToken({
    loading,
    disabled,
    reward,
    index,
    totalAmount,
    spender,
    onApprove,
}: ApproveTokenProps) {
    const t = useTranslations("newCampaign.submit.approveRewards");
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const [approving, setApproving] = useState(false);

    const { data: simulatedApprove, isLoading: simulatingApprove } =
        useSimulateContract(
            spender && {
                chainId,
                address: reward.token.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [spender, reward.amount.raw],
                query: {
                    enabled: !!spender && !!reward.token.address,
                },
            },
        );
    const { writeContractAsync: approveAsync, isPending: signingTransaction } =
        useWriteContract();

    const handleClick = useCallback(() => {
        if (!approveAsync || !publicClient || !simulatedApprove?.request)
            return;
        let cancelled = false;
        const approve = async () => {
            setApproving(true);
            try {
                const tx = await approveAsync(simulatedApprove.request);
                await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });
                if (!cancelled) onApprove();
            } catch (error) {
                console.warn("could not approve reward", error);
            } finally {
                setApproving(false);
            }
        };
        void approve();
        return () => {
            cancelled = true;
        };
    }, [approveAsync, simulatedApprove?.request, onApprove, publicClient]);

    return (
        <Button
            icon={RewardIcon}
            iconPlacement="right"
            onClick={handleClick}
            disabled={!approveAsync || disabled}
            loading={
                loading || simulatingApprove || signingTransaction || approving
            }
            className={{ root: styles.button }}
        >
            {signingTransaction || approving
                ? t("approving", {
                      amount: formatAmount({
                          amount: reward.amount.formatted,
                      }),
                      symbol: reward.token.symbol,
                      currentIndex: index,
                      totalAmount,
                  })
                : t("approve", {
                      amount: formatAmount({
                          amount: reward.amount.formatted,
                      }),
                      symbol: reward.token.symbol,
                      currentIndex: index,
                      totalAmount,
                  })}
        </Button>
    );
}
