import {
    type CampaignPayload,
    type CampaignPayloadPart,
    type CampaignPayloadErrors,
    RewardType,
} from "@/src/types";
import { useAccount, useChainId, useChains } from "wagmi";
import { useMemo } from "react";
import { DexStep } from "./dex-step";
import { PoolStep } from "./pool-step";
import { StartDateStep } from "./start-date-step";
import { EndDateStep } from "./end-date-step";
import { RewardsStep } from "./rewards-step";
import { RestrictionsStep } from "./restrictions-step";
import { KpiStep } from "./kpi-step";
import { KPI } from "@/src/commons/env";
import { RangeStep } from "./range-step";

import styles from "./styles.module.css";

export interface CreateCampaignFormProps {
    payload?: CampaignPayload;
    onPayloadChange: (part: CampaignPayloadPart) => void;
    onPayloadError: (errors: CampaignPayloadErrors) => void;
}

export function CreateCampaignForm({
    payload,
    onPayloadChange,
    onPayloadError,
}: CreateCampaignFormProps) {
    const { chain: connectedChain, isConnected } = useAccount();
    const selectedChain = useChainId();
    const chains = useChains();

    const unsupportedChain = useMemo(() => {
        return (
            isConnected &&
            (!connectedChain ||
                !chains.some((chain) => chain.id === selectedChain))
        );
    }, [chains, connectedChain, isConnected, selectedChain]);

    return (
        <div className={styles.root}>
            <DexStep
                disabled={unsupportedChain}
                dex={payload?.dex}
                onDexChange={onPayloadChange}
            />
            <PoolStep
                disabled={!payload?.dex || unsupportedChain}
                dex={payload?.dex}
                pool={payload?.pool}
                onPoolChange={onPayloadChange}
            />
            <StartDateStep
                disabled={!payload?.pool || unsupportedChain}
                startDate={payload?.startDate}
                endDate={payload?.endDate}
                onStartDateChange={onPayloadChange}
                onError={onPayloadError}
            />
            <EndDateStep
                disabled={!payload?.startDate || unsupportedChain}
                startDate={payload?.startDate}
                endDate={payload?.endDate}
                onEndDateChange={onPayloadChange}
                onError={onPayloadError}
            />
            <RewardsStep
                disabled={!payload?.endDate || unsupportedChain}
                rewardType={payload?.rewardType}
                pool={payload?.pool}
                tokens={payload?.tokens}
                points={payload?.points}
                feeToken={payload?.feeToken}
                startDate={payload?.startDate}
                endDate={payload?.endDate}
                onRewardsChange={onPayloadChange}
                onError={onPayloadError}
            />
            {KPI && (
                <KpiStep
                    disabled={
                        !payload?.tokens ||
                        payload.rewardType === RewardType.Points ||
                        unsupportedChain
                    }
                    pool={payload?.pool}
                    rewards={payload?.tokens}
                    kpiSpecification={payload?.kpiSpecification}
                    onKpiChange={onPayloadChange}
                    onError={onPayloadError}
                />
            )}
            <RangeStep
                disabled={false}
                rangeSpecification={payload?.rangeSpecification}
                onRangeChange={onPayloadChange}
                onError={onPayloadError}
            />
            <RestrictionsStep
                disabled={!payload?.tokens || unsupportedChain}
                restrictions={payload?.restrictions}
                onRestrictionsChange={onPayloadChange}
                onError={onPayloadError}
            />
        </div>
    );
}
