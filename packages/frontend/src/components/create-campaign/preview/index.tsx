import { Button, Typography, TextField, ErrorText } from "@metrom-xyz/ui";
import { RewardType, type CampaignPayload } from "@/src/types";
import {
    useChainId,
    usePublicClient,
    useSimulateContract,
    useWriteContract,
} from "wagmi";
import { metromAbi } from "@metrom-xyz/contracts/abi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MetromLightLogo } from "@/src/assets/metrom-light-logo";
import { useRouter } from "@/src/i18n/routing";
import { useChainData } from "@/src/hooks/useChainData";
import { ArrowRightIcon } from "@/src/assets/arrow-right-icon";
import { ApproveTokensButton } from "./approve-tokens-button";
import { Rewards } from "./rewards";
import { Header } from "./header";
import { formatTokenAmount, formatUsdAmount } from "@/src/utils/format";
import { getCampaignPreviewApr } from "@/src/utils/campaign";
import { trackFathomEvent } from "@/src/utils/fathom";
import {
    type Hex,
    zeroHash,
    parseUnits,
    formatUnits,
    encodeAbiParameters,
} from "viem";
import { encodeFunctionData } from "viem/utils";
import {
    SERVICE_URLS,
    type Specification,
    type WhitelistedErc20TokenAmount,
} from "@metrom-xyz/sdk";
import { ENVIRONMENT, KPI, SAFE } from "@/src/commons/env";
import SafeAppsSdk, { type BaseTransaction } from "@safe-global/safe-apps-sdk";
import { Kpi } from "./kpi";
import { AprChip } from "../../apr-chip";

import styles from "./styles.module.css";

const safeSdk = new SafeAppsSdk();

interface CampaignPreviewProps {
    malformedPayload: boolean;
    payload: CampaignPayload;
    onBack: () => void;
    onCreateNew: () => void;
}

export function CampaignPreview({
    malformedPayload,
    payload,
    onBack,
    onCreateNew,
}: CampaignPreviewProps) {
    const t = useTranslations("campaignPreview");
    const router = useRouter();
    const chainId = useChainId();
    const chainData = useChainData(chainId);
    const publicClient = usePublicClient();
    const { writeContractAsync } = useWriteContract();

    const feedback = useRef<HTMLDivElement>(null);

    const [deploying, setDeploying] = useState(false);
    const [uploadingSpecification, setUploadingSpecification] = useState(false);
    const [created, setCreated] = useState(false);
    const [tokensApproved, setTokensApproved] = useState(false);
    const [specificationHash, setSpecificationHash] = useState<Hex>(zeroHash);
    const [error, setError] = useState("");
    const [safeTxs, setSafeTxs] = useState<BaseTransaction[]>([]);

    const tokensToApprove = useMemo(() => {
        if (payload.rewardType === RewardType.tokens) return payload.tokens;

        if (payload.rewardType === RewardType.points && payload.feeToken) {
            const { amount, token } = payload.feeToken;

            const newRaw = (amount.raw * 115n) / 100n;

            const newFormatted = Number(formatUnits(newRaw, token.decimals));
            const feeToken: WhitelistedErc20TokenAmount = {
                token,
                amount: {
                    raw: newRaw,
                    formatted: newFormatted,
                    usdValue: newFormatted * token.usdPrice,
                },
            };

            return [feeToken];
        }
    }, [payload.feeToken, payload.rewardType, payload.tokens]);

    const [tokensCampaignArgs, pointsCampaignArgs] = useMemo(() => {
        const { pool, startDate, endDate, tokens, points, feeToken } = payload;

        if (!tokensApproved || !pool || !startDate || !endDate) return [[], []];

        if (
            payload.rewardType === RewardType.tokens &&
            tokens &&
            tokens.length > 0
        )
            return [
                [
                    {
                        from: startDate.unix(),
                        to: endDate.unix(),
                        kind: 1,
                        data: encodeAbiParameters(
                            [{ name: "poolAddress", type: "address" }],
                            [pool.address],
                        ),
                        specificationHash,
                        rewards: tokens.map((token) => ({
                            token: token.token.address,
                            amount: token.amount.raw,
                        })),
                    },
                ],
                [],
            ];

        if (payload.rewardType === RewardType.points && points && feeToken)
            return [
                [],
                [
                    {
                        from: startDate.unix(),
                        to: endDate.unix(),
                        kind: 1,
                        data: encodeAbiParameters(
                            [{ name: "poolAddress", type: "address" }],
                            [pool.address],
                        ),
                        specificationHash,
                        points: parseUnits(points.toString(), 18),
                        feeToken: feeToken.token.address,
                    },
                ],
            ];

        return [[], []];
    }, [payload, specificationHash, tokensApproved]);

    const {
        data: simulatedCreate,
        isLoading: simulatingCreate,
        isError: simulateCreateErrored,
        error: simulateCreateError,
    } = useSimulateContract({
        abi: metromAbi,
        address: chainData?.metromContract.address,
        functionName: "createCampaigns",
        args: [tokensCampaignArgs, pointsCampaignArgs],
        query: {
            enabled:
                !SAFE &&
                !malformedPayload &&
                (tokensCampaignArgs.length > 0 ||
                    pointsCampaignArgs.length > 0),
        },
    });

    useEffect(() => {
        const uploadSpecification = async () => {
            setUploadingSpecification(true);

            const { restrictions, kpiSpecification } = payload;

            let specification: Specification = {
                kpi: kpiSpecification,
            };
            if (restrictions)
                specification[restrictions.type] = restrictions?.list;

            try {
                const response = await fetch(
                    `${SERVICE_URLS[ENVIRONMENT].dataManager}/data/temporary`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(specification),
                    },
                );

                if (!response.ok) throw new Error(await response.text());

                const { hash } = (await response.json()) as { hash: Hex };
                setSpecificationHash(`0x${hash}`);
            } catch (error) {
                console.error(
                    `Could not upload specification to data-manager: ${JSON.stringify(specification)}`,
                    error,
                );
                setError("errors.specification");
            } finally {
                setUploadingSpecification(false);
            }
        };

        if (
            (payload.kpiSpecification || payload.restrictions) &&
            tokensApproved
        )
            uploadSpecification();
    }, [
        payload,
        payload.kpiSpecification,
        payload.restrictions,
        tokensApproved,
    ]);

    const handleSafeTransaction = useCallback(
        (tx: BaseTransaction) => {
            setSafeTxs([...safeTxs, tx]);
        },
        [safeTxs],
    );

    function handleOnRewardsApproved() {
        setTokensApproved(true);
    }

    const handleStandardDeploy = useCallback(() => {
        if (simulateCreateErrored) {
            console.warn(
                `Could not deploy the campaign: ${simulateCreateError}`,
            );
            return;
        }

        if (!writeContractAsync || !publicClient || !simulatedCreate?.request)
            return;

        const create = async () => {
            setDeploying(true);
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
                trackFathomEvent("CLICK_DEPLOY_CAMPAIGN");
            } catch (error) {
                console.warn("Could not create campaign", error);
            } finally {
                setDeploying(false);
            }
        };
        void create();
    }, [
        publicClient,
        simulateCreateError,
        simulateCreateErrored,
        simulatedCreate?.request,
        writeContractAsync,
    ]);

    const handleSafeDeploy = useCallback(() => {
        if (
            !chainData?.metromContract.address ||
            !payload.pool ||
            !payload.startDate ||
            !payload.endDate ||
            (payload.tokens?.length === 0 && payload.points === undefined)
        ) {
            console.warn(
                "Missing parameters to deploy campaign through Safe: aborting",
            );
            return;
        }

        safeTxs.push({
            to: chainData.metromContract.address,
            data: encodeFunctionData({
                abi: metromAbi,
                functionName: "createCampaigns",
                args: [tokensCampaignArgs, pointsCampaignArgs],
            }),
            value: "0",
        });

        const create = async () => {
            setDeploying(true);
            try {
                await safeSdk.txs.send({ txs: safeTxs });

                setCreated(true);
                trackFathomEvent("CLICK_DEPLOY_CAMPAIGN");
            } catch (error) {
                console.warn("Could not create campaign", error);
            } finally {
                setDeploying(false);
            }
        };

        void create();
    }, [
        chainData,
        payload.pool,
        payload.startDate,
        payload.endDate,
        payload.tokens?.length,
        payload.points,
        safeTxs,
        tokensCampaignArgs,
        pointsCampaignArgs,
    ]);

    function handleGoToAllCampaigns() {
        router.push("/");
    }

    // TODO: add notification toast in case of errors
    if (!created) {
        return (
            <div ref={feedback} className={styles.root}>
                <Header
                    backDisabled={simulatingCreate || deploying}
                    payload={payload}
                    onBack={onBack}
                />
                <div className={styles.content}>
                    {KPI && !!payload.kpiSpecification && (
                        <Kpi
                            poolUsdTvl={payload.pool?.usdTvl}
                            rewards={payload.tokens}
                            specification={payload.kpiSpecification}
                        />
                    )}
                    <div className={styles.contentGrid}>
                        <TextField
                            boxed
                            size="xl"
                            label={t("tvl")}
                            value={formatUsdAmount(payload.pool?.usdTvl)}
                        />
                        {payload.rewardType === RewardType.tokens && (
                            <TextField
                                boxed
                                size="xl"
                                label={t("apr")}
                                value={
                                    <AprChip
                                        size="lg"
                                        apr={getCampaignPreviewApr(payload)}
                                        kpi={!!payload.kpiSpecification}
                                    />
                                }
                            />
                        )}
                        {payload.rewardType === RewardType.points && (
                            <TextField
                                boxed
                                size="xl"
                                label={t("points")}
                                value={formatTokenAmount({
                                    amount: payload.points,
                                })}
                            />
                        )}
                    </div>
                    {payload.rewardType === RewardType.tokens && (
                        <Rewards
                            rewards={payload.tokens}
                            startDate={payload.startDate}
                            endDate={payload.endDate}
                        />
                    )}
                    <div className={styles.deployButtonContainer}>
                        {error && (
                            <ErrorText size="xs" weight="medium">
                                {t(error)}
                            </ErrorText>
                        )}
                        {tokensApproved && (
                            <Button
                                icon={ArrowRightIcon}
                                iconPlacement="right"
                                disabled={
                                    !!error ||
                                    malformedPayload ||
                                    simulateCreateErrored
                                }
                                loading={
                                    uploadingSpecification ||
                                    simulatingCreate ||
                                    deploying
                                }
                                className={{ root: styles.deployButton }}
                                onClick={
                                    SAFE
                                        ? handleSafeDeploy
                                        : handleStandardDeploy
                                }
                            >
                                {t("deploy")}
                            </Button>
                        )}
                        <ApproveTokensButton
                            malformedPayload={malformedPayload}
                            tokens={tokensToApprove}
                            onApproved={handleOnRewardsApproved}
                            onSafeTx={handleSafeTransaction}
                        />
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
            <Typography size="xl2" weight="medium">
                {SAFE ? t("launched.safe.1") : t("launched.standard")}
            </Typography>
            {SAFE && (
                <Typography size="xl2" weight="medium">
                    {t("launched.safe.2")}
                </Typography>
            )}
            <div className={styles.feedbackActionsContainer}>
                <Button
                    onClick={handleGoToAllCampaigns}
                    variant="secondary"
                    className={{ root: styles.feedbackButton }}
                >
                    {t("allCampaigns")}
                </Button>
                <Button
                    onClick={onCreateNew}
                    className={{ root: styles.feedbackButton }}
                >
                    {t("newCampaign")}
                </Button>
            </div>
        </div>
    );
}
