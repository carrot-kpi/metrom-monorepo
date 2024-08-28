import { Button } from "@/src/ui/button";
import type { CampaignPayload } from "@/src/types";
import { NewCampaignIcon } from "@/src/assets/new-campaign-icon";
import {
    useAccount,
    useChainId,
    usePublicClient,
    useSimulateContract,
    useWriteContract,
} from "wagmi";
import Confetti from "react-confetti";
import numeral from "numeral";
import { useWindowSize } from "react-use";
import { parseUnits } from "viem";
import dayjs from "dayjs";
import { metromAbi } from "@metrom-xyz/contracts/abi";
import { CHAIN_DATA } from "@/src/commons";
import type { SupportedChain } from "@metrom-xyz/contracts";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { WalletIcon } from "@/src/assets/wallet-icon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Typography } from "@/src/ui/typography";
import { MetromLightLogo } from "@/src/assets/metrom-light-logo";
import { useRouter } from "@/src/navigation";
import { TextField } from "@/src/ui/text-field";
import { Rewards } from "./rewards";
import { Header } from "./header";

import styles from "./styles.module.css";

interface CampaignPreviewProps {
    malformedPayload: boolean;
    payload: CampaignPayload;
    onBack: () => void;
}

export function CampaignPreview({
    malformedPayload,
    payload,
    onBack,
}: CampaignPreviewProps) {
    const t = useTranslations("campaignPreview");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);

    const feedback = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { width, height } = useWindowSize();
    const { openConnectModal } = useConnectModal();
    const chain: SupportedChain = useChainId();
    const publicClient = usePublicClient();
    const { address: connectedAddress } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const secondsDuration = useMemo(() => {
        if (!payload.endDate) return 0;
        return payload.endDate.diff(payload.startDate, "seconds", false);
    }, [payload.endDate, payload.startDate]);

    const {
        data: simulatedCreate,
        isLoading: simulatingCreate,
        isError: simulateCreateError,
    } = useSimulateContract({
        abi: metromAbi,
        address: CHAIN_DATA[chain].contract.address,
        functionName: "createCampaigns",
        args: [
            payload.pool &&
            payload.startDate &&
            payload.endDate &&
            payload.rewards &&
            payload.rewards.length > 0
                ? [
                      {
                          pool: payload.pool.address,
                          from: payload.startDate.unix(),
                          to: payload.endDate.unix(),
                          // TODO: add specification
                          specification:
                              "0x0000000000000000000000000000000000000000000000000000000000000000",
                          rewards: payload.rewards.map((reward) => ({
                              token: reward.token.address,
                              amount: parseUnits(
                                  reward.amount.toString(),
                                  reward.token.decimals,
                              ),
                          })),
                      },
                  ]
                : [],
        ],
        query: {
            enabled:
                !malformedPayload &&
                !!payload.pool &&
                !!payload.startDate &&
                !!payload.endDate &&
                !!payload.rewards &&
                payload.rewards.length > 0,
        },
    });

    const handleOnDeploy = useCallback(() => {
        if (!writeContractAsync || !publicClient || !simulatedCreate?.request)
            return;
        const create = async () => {
            setCreating(true);
            try {
                const tx = await writeContractAsync(simulatedCreate.request);
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });

                if (receipt.status === "reverted") {
                    console.warn("creation transaction reverted");
                    return;
                }

                setCreated(true);
            } catch (error) {
                console.warn("could not create kpi token", error);
            } finally {
                setCreating(false);
            }
        };
        void create();
    }, [publicClient, simulatedCreate, writeContractAsync]);

    function handleGoToAllCampaigns() {
        router.push("/");
    }

    // TODO: add notification toast in case of errors
    if (!created) {
        return (
            <div ref={feedback} className={styles.root}>
                <Header
                    backDisabled={simulatingCreate || creating}
                    payload={payload}
                    onBack={onBack}
                />
                <div className={styles.content}>
                    <div className={styles.contentGrid}>
                        <TextField
                            boxed
                            label={t("tvl")}
                            value={numeral(payload.pool?.tvl).format(
                                "($ 0.00 a)",
                            )}
                        />
                        {/* TODO: add apr */}
                        <TextField boxed label={t("apr")} value={"0.0%"} />
                    </div>
                    <Rewards
                        rewards={payload.rewards}
                        campaignDurationSeconds={secondsDuration}
                    />
                    <div className={styles.createButtonContainer}>
                        {!connectedAddress ? (
                            <Button
                                icon={WalletIcon}
                                iconPlacement="right"
                                disabled={malformedPayload}
                                className={{ root: styles.createButton }}
                                onClick={openConnectModal}
                            >
                                {t("connectWallet")}
                            </Button>
                        ) : (
                            <Button
                                icon={NewCampaignIcon}
                                iconPlacement="right"
                                disabled={
                                    malformedPayload || simulateCreateError
                                }
                                loading={simulatingCreate || creating}
                                className={{ root: styles.createButton }}
                                onClick={handleOnDeploy}
                            >
                                {t("deploy")}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.feedback}>
            <MetromLightLogo className={styles.metromLogo} />
            <Typography uppercase weight="medium">
                {t("congratulations")}
            </Typography>
            <Typography variant="xl2" weight="medium">
                {t("launched")}
            </Typography>
            <div className={styles.feedbackActionsContainer}>
                <Button
                    onClick={handleGoToAllCampaigns}
                    variant="secondary"
                    className={{ root: styles.feedbackButton }}
                >
                    {t("allCampaigns")}
                </Button>
                <Button
                    onClick={onBack}
                    className={{ root: styles.feedbackButton }}
                >
                    {t("newCampaign")}
                </Button>
            </div>
            <Confetti
                numberOfPieces={600}
                confettiSource={{
                    x: 0,
                    y: 0,
                    w: width,
                    h: height,
                }}
                run={true}
                width={width}
                height={height}
                recycle={false}
                initialVelocityY={30}
                colors={["#163A5F", "#45EBA5", "#21ABA5", "#1D566E", "#163A5F"]}
            />
        </div>
    );
}
