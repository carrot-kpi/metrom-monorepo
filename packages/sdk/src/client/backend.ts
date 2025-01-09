import { formatUnits, type Address, type Hex } from "viem";
import {
    type BackendActivity,
    type BackendCampaign,
    type BackendClaim,
    type BackendPool,
    type BackendWhitelistedErc20Token,
    type BackendReimbursement,
    type BackendKpiMeasurement,
    type BackendLeaderboard,
    type BackendRewardsCampaignLeaderboardRank,
    type BackendInitializedTicks,
} from "./types";
import type { SupportedChain } from "@metrom-xyz/contracts";
import { SupportedDex } from "../commons";
import {
    Status,
    type Activity,
    type Campaign,
    type Claim,
    type KpiMeasurement,
    type Leaderboard,
    type LiquidityDensity,
    type OnChainAmount,
    type PointsCampaignLeaderboardRank,
    type Pool,
    type Reimbursement,
    type Rewards,
    type RewardsCampaignLeaderboardRank,
    type Tick,
    type UsdPricedErc20TokenAmount,
    type UsdPricedOnChainAmount,
    type WhitelistedErc20Token,
} from "../types";
import { getPrice } from "../utils";

const MIN_TICK = -887272;
const MAX_TICK = -MIN_TICK;
const COMPUTE_TICKS_AMOUNT = 1500;
const TICK_AVERAGE_FACTOR = 100;
const BI_1_000_000 = BigInt(1_000_000);

export interface FetchCampaignParams {
    chainId: number;
    id: Hex;
}

export interface FetchPoolsParams {
    chainId: SupportedChain;
    dex: SupportedDex;
}

export interface FetchClaimsParams {
    address: Address;
}

export interface FetchReimbursementsParams {
    address: Address;
}

export interface FetchWhitelistedTokensParams {
    chainId: SupportedChain;
}

export interface FetchActivitiesParams {
    chainId: number;
    address: Address;
    from: number;
    to: number;
}

export interface FetchWhitelistedRewardTokensParams {
    tokens: Address;
}

export interface FetchKpiMeasurementsParams {
    campaign: Campaign;
    from: number;
    to: number;
}

export interface FetchLeaderboardParams {
    campaign: Campaign;
    account?: Address;
}

export interface FetchTicksParams {
    chainId: number;
    pool: Pool;
    surroundingAmount: number;
}

interface InitializedTick {
    idx: number;
    liquidity: {
        gross: bigint;
        net: bigint;
    };
}

interface ProcessedTick {
    idx: number;
    liquidity: {
        gross: bigint;
        net: bigint;
        active: bigint;
    };
    price0: number;
    price1: number;
}

enum Direction {
    Asc,
    Desc,
}

export class MetromApiClient {
    constructor(public readonly baseUrl: string) {}

    async fetchCampaigns(): Promise<Campaign[]> {
        const response = await fetch(new URL("v1/campaigns", this.baseUrl));
        if (!response.ok)
            throw new Error(
                `response not ok while fetching campaigns: ${await response.text()}`,
            );

        const backendCampaigns = (await response.json()) as BackendCampaign[];

        return backendCampaigns.map(processCampaign);
    }

    async fetchCampaign(params: FetchCampaignParams): Promise<Campaign> {
        const response = await fetch(
            new URL(
                `v1/campaigns/${params.chainId}/${params.id}`,
                this.baseUrl,
            ),
        );
        if (!response.ok)
            throw new Error(
                `response not ok while fetching campaign with id ${params.id} on chain id ${params.chainId}: ${await response.text()}`,
            );

        return processCampaign((await response.json()) as BackendCampaign);
    }

    async fetchPools(params: FetchPoolsParams): Promise<Pool[]> {
        const url = new URL(
            `v1/pools/${params.chainId}/${params.dex}`,
            this.baseUrl,
        );

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching pools: ${await response.text()}`,
            );

        const backendPools = (await response.json()) as BackendPool[];

        return backendPools.map((pool) => ({
            ...pool,
            chainId: params.chainId,
        }));
    }

    async fetchClaims(params: FetchClaimsParams): Promise<Claim[]> {
        const url = new URL(`v1/claims/${params.address}`, this.baseUrl);

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching claimable rewards: ${await response.text()}`,
            );

        const claims = (await response.json()) as BackendClaim[];

        return claims.map((claim) => {
            return {
                ...claim,
                amount: stringToOnChainAmount(
                    claim.amount,
                    claim.token.decimals,
                ),
            };
        });
    }

    async fetchReimbursements(
        params: FetchReimbursementsParams,
    ): Promise<Reimbursement[]> {
        const url = new URL(
            `v1/reimbursements/${params.address}`,
            this.baseUrl,
        );

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching reimbursements: ${await response.text()}`,
            );

        const reimbursements =
            (await response.json()) as BackendReimbursement[];

        return reimbursements.map((reimbursement) => {
            return {
                ...reimbursement,
                amount: stringToOnChainAmount(
                    reimbursement.amount,
                    reimbursement.token.decimals,
                ),
                proof: reimbursement.proof,
            };
        });
    }

    async fetchWhitelistedRewardTokens(
        params: FetchWhitelistedTokensParams,
    ): Promise<WhitelistedErc20Token[]> {
        return fetchWhitelistedTokens(
            new URL(`v1/reward-tokens/${params.chainId}`, this.baseUrl),
        );
    }

    async fetchWhitelistedFeeTokens(
        params: FetchWhitelistedTokensParams,
    ): Promise<WhitelistedErc20Token[]> {
        return fetchWhitelistedTokens(
            new URL(`v1/fee-tokens/${params.chainId}`, this.baseUrl),
        );
    }

    async fetchActivities(params: FetchActivitiesParams): Promise<Activity[]> {
        const url = new URL(
            `v1/activities/${params.chainId}/${params.address}`,
            this.baseUrl,
        );

        url.searchParams.set("from", params.from.toString());
        url.searchParams.set("to", params.to.toString());

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching activity for address ${params.address} from ${params.from} to ${params.to}: ${await response.text()}`,
            );

        const activities = (await response.json()) as BackendActivity[];

        return activities.map((activity) => {
            if (activity.payload.type === "claim-reward") {
                return {
                    ...activity,
                    payload: {
                        ...activity.payload,
                        amount: stringToOnChainAmount(
                            activity.payload.amount,
                            activity.payload.token.decimals,
                        ),
                    },
                };
            } else {
                return activity as Activity;
            }
        });
    }

    async fetchKpiMeasurements(
        params: FetchKpiMeasurementsParams,
    ): Promise<KpiMeasurement[]> {
        if (
            !params.campaign.specification ||
            !params.campaign.specification.kpi
        )
            throw new Error(
                `tried to fetch kpi measurements for campaign with id ${params.campaign.id} in chain with id ${params.campaign.chainId} with no attached kpi`,
            );

        const rewards = params.campaign.rewards;
        if (!rewards)
            throw new Error(
                `tried to fetch kpi measurements for campaign with id ${params.campaign.id} in chain with id ${params.campaign.chainId} with no rewards`,
            );

        const url = new URL(
            `v1/kpi-measurements/${params.campaign.chainId}/${params.campaign.id}`,
            this.baseUrl,
        );

        url.searchParams.set("from", params.from.toString());
        url.searchParams.set("to", params.to.toString());

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching kpi measurements for campaign with id ${params.campaign.id} in chain with id ${params.campaign.chainId} from ${params.from} to ${params.to}: ${await response.text()}`,
            );

        const measurements = (await response.json()) as BackendKpiMeasurement[];

        const minimumPayoutPercentage =
            params.campaign.specification!.kpi!.minimumPayoutPercentage || 0;

        const totalCampaignDuration = params.campaign.to - params.campaign.from;
        return measurements.map((measurement) => {
            const measuredPeriodDuration = Math.min(
                measurement.to - measurement.from,
                params.campaign.to - params.campaign.from,
            );
            const periodDurationMultiplier = {
                standard: measuredPeriodDuration / totalCampaignDuration,
                get scaled() {
                    return BigInt(Math.floor(this.standard * 1_000_000));
                },
            };

            const distributions = rewards.map((reward) => {
                const normalizedKpiMeasurementPercentage = Math.min(
                    Math.max(measurement.percentage, 0),
                    1,
                );
                const boundPercentage = {
                    standard:
                        minimumPayoutPercentage +
                        (1 - minimumPayoutPercentage) *
                            normalizedKpiMeasurementPercentage,
                    get scaled() {
                        return BigInt(Math.floor(this.standard * 1_000_000));
                    },
                };

                const totalDistributedInPeriodFormatted =
                    reward.amount.formatted * periodDurationMultiplier.standard;
                const totalDistributedInPeriodRaw =
                    (reward.amount.raw * periodDurationMultiplier.scaled) /
                    BI_1_000_000;

                const distributedToLpsInPeriodFormatted =
                    totalDistributedInPeriodFormatted *
                    boundPercentage.standard;

                const distributedToLpsInPeriodRaw =
                    (totalDistributedInPeriodRaw * boundPercentage.scaled) /
                    BI_1_000_000;

                const distributedInPeriod: UsdPricedOnChainAmount = {
                    raw: distributedToLpsInPeriodRaw,
                    formatted: distributedToLpsInPeriodFormatted,
                    usdValue:
                        distributedToLpsInPeriodFormatted *
                        reward.token.usdPrice,
                };

                const reimbursedInPeriodFormatted =
                    totalDistributedInPeriodFormatted -
                    distributedToLpsInPeriodFormatted;
                const reimbursedInPeriod: UsdPricedOnChainAmount = {
                    raw:
                        totalDistributedInPeriodRaw -
                        distributedToLpsInPeriodRaw,
                    formatted: reimbursedInPeriodFormatted,
                    usdValue:
                        reimbursedInPeriodFormatted * reward.token.usdPrice,
                };

                return {
                    token: reward.token,
                    distributed: distributedInPeriod,
                    reimbursed: reimbursedInPeriod,
                };
            });

            const goalLowerTarget =
                params.campaign.specification!.kpi!.goal.lowerUsdTarget;
            const goalUpperTarget =
                params.campaign.specification!.kpi!.goal.upperUsdTarget;
            const goalRange = goalUpperTarget - goalLowerTarget;

            return {
                from: measurement.from,
                to: measurement.to,
                percentage: measurement.percentage,
                value: goalLowerTarget + goalRange * measurement.percentage,
                distributions,
            };
        });
    }

    async fetchLeaderboard(
        params: FetchLeaderboardParams,
    ): Promise<Leaderboard | null> {
        const url = new URL(
            `v1/leaderboards/${params.campaign.chainId}/${params.campaign.id}`,
            this.baseUrl,
        );

        if (params.account)
            url.searchParams.set("account", params.account.toString());

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching leaderboard for campaign with id ${params.campaign.id} in chain with id ${params.campaign.chainId}: ${await response.text()}`,
            );

        const { updatedAt, ranks: rawRanks } =
            (await response.json()) as BackendLeaderboard;

        if (!updatedAt || !rawRanks || rawRanks.length === 0) {
            return null;
        }

        const ranks =
            typeof rawRanks[0].distributed === "string"
                ? rawRanks.map((rawRank) => {
                      return <PointsCampaignLeaderboardRank>{
                          ...rawRank,
                          weight: rawRank.weight * 100,
                          distributed: stringToOnChainAmount(
                              rawRank.distributed as string,
                              18,
                          ),
                      };
                  })
                : rawRanks.map((rawRank) => {
                      return <RewardsCampaignLeaderboardRank>{
                          ...rawRank,
                          weight: rawRank.weight * 100,
                          distributed: (
                              rawRank.distributed as BackendRewardsCampaignLeaderboardRank["distributed"]
                          ).map((distributed) => {
                              return <UsdPricedErc20TokenAmount>{
                                  token: distributed,
                                  amount: stringToUsdPricedOnChainAmount(
                                      distributed.amount,
                                      distributed.decimals,
                                      distributed.usdPrice,
                                  ),
                              };
                          }),
                      };
                  });

        return {
            updatedAt,
            ranks,
        };
    }

    async fetchLiquidityDensity(
        params: FetchTicksParams,
    ): Promise<LiquidityDensity> {
        const url = new URL(
            `v1/initialized-ticks/${params.chainId}/${params.pool.address}`,
            this.baseUrl,
        );

        if (params.surroundingAmount)
            url.searchParams.set(
                "surroundingTicksAmount",
                params.surroundingAmount.toString(),
            );

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `response not ok while fetching ${params.surroundingAmount} surrounding initialized ticks for pool ${params.pool.address} in chain with id ${params.chainId}: ${await response.text()}`,
            );

        const { activeTick, ticks: initializedTicks } =
            (await response.json()) as BackendInitializedTicks;

        const initializedTicksByIdx = initializedTicks.reduce(
            (acc: Record<number, InitializedTick>, tick) => {
                acc[tick.idx] = {
                    idx: tick.idx,
                    liquidity: {
                        gross: BigInt(tick.liquidityGross),
                        net: BigInt(tick.liquidityNet),
                    },
                };
                return acc;
            },
            {},
        );

        const price0 = getPrice(activeTick.idx, params.pool);
        const activeTickProcessed: ProcessedTick = {
            idx: activeTick.idx,
            liquidity: {
                active: BigInt(activeTick.liquidity),
                net: 0n,
                gross: 0n,
            },
            price0,
            price1: 1 / price0,
        };

        // If our active tick happens to be initialized (i.e. there is a position that starts or
        // ends at that tick), ensure we set the gross and net.
        // correctly.
        const initializedActiveTick = initializedTicksByIdx[activeTick.idx];
        if (initializedActiveTick) {
            activeTickProcessed.liquidity.gross =
                initializedActiveTick.liquidity.gross;
            activeTickProcessed.liquidity.net =
                initializedActiveTick.liquidity.net;
        }

        const subsequentTicks = computeSurroundingTicks(
            initializedTicksByIdx,
            activeTickProcessed,
            params.pool,
            COMPUTE_TICKS_AMOUNT,
            Direction.Asc,
        );

        const previousTicks = computeSurroundingTicks(
            initializedTicksByIdx,
            activeTickProcessed,
            params.pool,
            COMPUTE_TICKS_AMOUNT,
            Direction.Desc,
        );

        const ticks = averageTicks(previousTicks)
            .concat({
                idx: activeTickProcessed.idx,
                liquidity: activeTickProcessed.liquidity.active,
                price0: activeTickProcessed.price0,
                price1: activeTickProcessed.price1,
            })
            .concat(averageTicks(subsequentTicks));

        return {
            activeIdx: activeTick.idx,
            ticks,
        };
    }
}

function processCampaign(backendCampaign: BackendCampaign): Campaign {
    const from = Number(backendCampaign.from);
    const to = Number(backendCampaign.to);

    let status;
    const now = Number(Math.floor(Date.now() / 1000));
    if (now < from) {
        status = Status.Upcoming;
    } else if (now > to) {
        status = Status.Ended;
    } else {
        status = Status.Live;
    }

    const rewards: Rewards = Object.assign([], {
        amountUsdValue: 0,
        remainingUsdValue: 0,
    });
    for (const backendReward of backendCampaign.rewards || []) {
        const amount = stringToUsdPricedOnChainAmount(
            backendReward.amount,
            backendReward.decimals,
            backendReward.usdPrice,
        );
        const remaining = stringToUsdPricedOnChainAmount(
            backendReward.remaining,
            backendReward.decimals,
            backendReward.usdPrice,
        );

        rewards.amountUsdValue += amount.usdValue;
        rewards.remainingUsdValue += remaining.usdValue;

        rewards.push({
            token: backendReward,
            amount,
            remaining,
        });
    }

    const campaign: Campaign = {
        ...backendCampaign,
        from,
        to,
        createdAt: Number(backendCampaign.createdAt),
        snapshottedAt: backendCampaign.snapshottedAt
            ? Number(backendCampaign.snapshottedAt)
            : null,
        status,
        pool: {
            chainId: backendCampaign.chainId,
            ...backendCampaign.pool,
        },
        rewards,
        points: backendCampaign.points
            ? stringToOnChainAmount(backendCampaign.points, 18)
            : null,
    };

    return campaign;
}

function stringToOnChainAmount(value: string, decimals: number): OnChainAmount {
    const rawAmount = BigInt(value);
    const formattedAmount = Number(formatUnits(rawAmount, decimals));
    return {
        raw: rawAmount,
        formatted: formattedAmount,
    };
}

function stringToUsdPricedOnChainAmount(
    value: string,
    decimals: number,
    usdPrice: number,
): UsdPricedOnChainAmount {
    const { raw, formatted } = stringToOnChainAmount(value, decimals);
    return {
        raw,
        formatted,
        usdValue: formatted * usdPrice,
    };
}

async function fetchWhitelistedTokens(
    url: URL,
): Promise<WhitelistedErc20Token[]> {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(
            `response not ok while fetching whitelisted tokens: ${await response.text()}`,
        );

    const whitelistedTokens =
        (await response.json()) as BackendWhitelistedErc20Token[];

    return whitelistedTokens.map((token) => {
        return {
            ...token,
            minimumRate: stringToOnChainAmount(
                token.minimumRate,
                token.decimals,
            ),
        };
    });
}

function computeSurroundingTicks(
    initializedTicksByIdx: Record<number, InitializedTick>,
    activeTickProcessed: ProcessedTick,
    pool: Pool,
    numSurroundingTicks: number,
    direction: Direction,
): Tick[] {
    let previousTickProcessed: ProcessedTick = {
        ...activeTickProcessed,
    };

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks: ProcessedTick[] = [];
    for (let i = 0; i < numSurroundingTicks; i++) {
        const currentTickIdx =
            direction == Direction.Asc
                ? previousTickProcessed.idx + 1
                : previousTickProcessed.idx - 1;

        if (currentTickIdx < MIN_TICK || currentTickIdx > MAX_TICK) {
            break;
        }

        const price0 = getPrice(currentTickIdx, pool);
        const currentTickProcessed: ProcessedTick = {
            idx: currentTickIdx,
            liquidity: {
                active: previousTickProcessed.liquidity.active,
                net: 0n,
                gross: 0n,
            },
            price0: price0,
            price1: 1 / price0,
        };

        // Check if there is an initialized tick at our current tick.
        // If so copy the gross and net liquidity from the initialized tick.
        const initializedCurrentTick = initializedTicksByIdx[currentTickIdx];
        if (initializedCurrentTick) {
            currentTickProcessed.liquidity.gross =
                initializedCurrentTick.liquidity.gross;
            currentTickProcessed.liquidity.net =
                initializedCurrentTick.liquidity.net;
        }

        // Update the active liquidity.
        // If we are iterating ascending and we found an initialized tick we immediately apply
        // it to the current processed tick we are building.
        // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
        if (direction == Direction.Asc && initializedCurrentTick) {
            currentTickProcessed.liquidity.active =
                previousTickProcessed.liquidity.active +
                initializedCurrentTick.liquidity.net;
        } else if (
            direction == Direction.Desc &&
            previousTickProcessed.liquidity.net != 0n
        ) {
            // We are iterating descending, so look at the previous tick and apply any net liquidity.
            currentTickProcessed.liquidity.active =
                previousTickProcessed.liquidity.active -
                previousTickProcessed.liquidity.net;
        }

        processedTicks.push(currentTickProcessed);
        previousTickProcessed = currentTickProcessed;
    }

    if (direction == Direction.Desc) {
        processedTicks = processedTicks.reverse();
    }

    return processedTicks.map((tick) => {
        return <Tick>{
            idx: tick.idx,
            liquidity: tick.liquidity.active,
            price0: tick.price0,
            price1: tick.price1,
        };
    });
}

function averageTicks(ticks: Tick[]) {
    const averagedTicks: Tick[] = [];
    let averageLiquidity = 0n;

    ticks.forEach((tick, index) => {
        averageLiquidity += tick.liquidity;

        if ((index + 1) % TICK_AVERAGE_FACTOR === 0) {
            averagedTicks.push({
                ...tick,
                liquidity: averageLiquidity / BigInt(TICK_AVERAGE_FACTOR),
            });
            averageLiquidity = 0n;
        }
    });

    return averagedTicks;
}
