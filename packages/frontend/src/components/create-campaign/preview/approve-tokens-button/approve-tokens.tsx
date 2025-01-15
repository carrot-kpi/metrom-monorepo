import { useCallback, useState, useEffect } from "react";
import { useReadContracts, useAccount } from "wagmi";
import { type Address, erc20Abi } from "viem";
import type { CampaignPayload } from "@/src/types";
import { ApproveToken } from "./approve-token";
import type { Erc20TokenAmount } from "@metrom-xyz/sdk";
import type { BaseTransaction } from "@safe-global/safe-apps-sdk";

interface ApproveRewardsProps {
    rewards?: CampaignPayload["tokens"];
    spender?: Address;
    disabled: boolean;
    onApprove: () => void;
    onSafeTx: (tx: BaseTransaction) => void;
}

export function ApproveTokens({
    rewards,
    spender,
    disabled,
    onApprove,
    onSafeTx,
}: ApproveRewardsProps) {
    const { address: connectedAddress } = useAccount();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [checkingApprovals, setCheckingApprovals] = useState(false);
    const [toApprove, setToApprove] = useState(rewards || []);
    const currentlyApprovingReward: Erc20TokenAmount | undefined =
        toApprove[currentIndex];

    const { data: allowances, isLoading: loadingAllowances } = useReadContracts(
        {
            contracts:
                connectedAddress &&
                spender &&
                rewards?.map((reward) => {
                    return {
                        address: reward.token.address,
                        abi: erc20Abi,
                        functionName: "allowance",
                        args: [connectedAddress, spender],
                    };
                }),
            query: {
                enabled: !!connectedAddress && !!rewards && !!spender,
            },
        },
    );

    useEffect(() => {
        if (!allowances || !rewards || allowances.length !== rewards.length)
            return;

        setCheckingApprovals(true);
        const newToApprove = [];
        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            if (
                allowances[i]?.result === null ||
                allowances[i]?.result === undefined
            )
                return;
            if ((allowances[i].result as bigint) >= reward.amount.raw) continue;
            newToApprove.push(reward);
        }
        if (newToApprove.length === 0) {
            onApprove();
            setCheckingApprovals(false);
            return;
        }
        setCheckingApprovals(false);
        setToApprove(newToApprove);
    }, [allowances, onApprove, rewards]);

    const handleApprove = useCallback(() => {
        if (!spender) {
            console.warn(
                "spender is undefined while handling approval: inconsistent state",
            );
            return;
        }

        const updatedIndex = currentIndex + 1;
        if (!toApprove[updatedIndex]) {
            onApprove();
        } else setCurrentIndex(updatedIndex);
    }, [currentIndex, onApprove, spender, toApprove]);

    return (
        <ApproveToken
            loading={
                checkingApprovals ||
                loadingAllowances ||
                !currentlyApprovingReward ||
                !spender
            }
            disabled={disabled}
            reward={currentlyApprovingReward}
            index={currentIndex + 1}
            totalAmount={rewards?.length || 0}
            spender={spender}
            onApprove={handleApprove}
            onSafeTx={onSafeTx}
        />
    );
}
