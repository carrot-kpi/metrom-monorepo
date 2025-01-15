import { type Address, type Hash } from "viem";
import type { SupportedAmm, SupportedDex } from "./commons";

export interface OnChainAmount {
    raw: bigint;
    formatted: number;
}

export interface UsdPricedOnChainAmount extends OnChainAmount {
    usdValue: number;
}

export interface Erc20Token {
    address: Address;
    decimals: number;
    symbol: string;
    name: string;
}

export interface UsdPricedErc20Token extends Erc20Token {
    usdPrice: number;
}

export interface Erc20TokenAmount {
    token: Erc20Token;
    amount: OnChainAmount;
}

export interface UsdPricedErc20TokenAmount {
    token: UsdPricedErc20Token;
    amount: UsdPricedOnChainAmount;
}

export interface Reward extends UsdPricedErc20TokenAmount {
    remaining: UsdPricedOnChainAmount;
}

export interface Pool {
    chainId: number;
    address: Address;
    dex: SupportedDex;
    amm: SupportedAmm;
    tokens: Erc20Token[];
    fee: number | null;
}

export interface Rewards extends Array<Reward> {
    amountUsdValue: number;
    remainingUsdValue: number;
}

export enum Status {
    Live = "live",
    Upcoming = "upcoming",
    Ended = "ended",
}

export enum KpiMetric {
    RangePoolTvl = "range-pool-tvl",
}

export interface RangePoolTvlKpiGoal {
    metric: KpiMetric.RangePoolTvl;
    lowerUsdTarget: number;
    upperUsdTarget: number;
}

export interface KpiSpecification {
    minimumPayoutPercentage?: number;
    goal: RangePoolTvlKpiGoal;
}

export interface Specification {
    whitelist?: Address[];
    blacklist?: Address[];
    kpi?: KpiSpecification;
}

export interface KpiSpecificationWithMeasurement extends KpiSpecification {
    measurement?: number;
}

export interface SpecificationWithKpiMeasurement extends Specification {
    kpi?: KpiSpecificationWithMeasurement;
}

export interface PoolWithTvl extends Pool {
    usdTvl: number;
}

export interface LiquidityDebt {
    brand: string;
    usdDebt: number;
}

export enum CampaignType {
    AmmPoolLiquidity = "amm-pool-liquidity",
    LiquidityDebt = "liquidity-debt",
}

export interface CampaignBase {
    chainId: number;
    id: Address;
    from: number;
    to: number;
    status: Status;
    createdAt: number;
    snapshottedAt: number | null;
    rewards: Rewards;
    points: OnChainAmount | null;
    apr: number | null;
    specification: SpecificationWithKpiMeasurement | null;
}

export type Campaign =
    | (CampaignBase & {
          type: CampaignType.AmmPoolLiquidity;
          target: PoolWithTvl;
      })
    | (CampaignBase & {
          type: CampaignType.LiquidityDebt;
          target: LiquidityDebt;
      });

export interface Claim extends Erc20TokenAmount {
    chainId: number;
    campaignId: Address;
    token: Erc20Token;
    amount: OnChainAmount;
    proof: Address[];
}

export type Reimbursement = Claim;

export interface WhitelistedErc20Token extends UsdPricedErc20Token {
    minimumRate: OnChainAmount;
    usdPrice: number;
}

export interface WhitelistedErc20TokenAmount {
    token: WhitelistedErc20Token;
    amount: UsdPricedOnChainAmount;
}

export interface Activity {
    transaction: {
        hash: Hash;
        timestamp: number;
    };
    payload:
        | {
              type: "claim-reward";
              token: Erc20Token;
              amount: OnChainAmount;
              receiver: Address;
          }
        | {
              type: "create-campaign";
              id: Hash;
          };
}

export interface KpiRewardDistribution {
    token: Erc20Token;
    distributed: UsdPricedOnChainAmount;
    reimbursed: UsdPricedOnChainAmount;
}

export interface KpiMeasurement {
    from: number;
    to: number;
    percentage: number;
    value: number;
    distributions: KpiRewardDistribution[];
}

export interface RewardsCampaignLeaderboardRank {
    account: Address;
    weight: number;
    position: number;
    distributed: UsdPricedErc20TokenAmount[];
}

export interface PointsCampaignLeaderboardRank {
    account: Address;
    weight: number;
    position: number;
    distributed: OnChainAmount;
}

export interface Leaderboard {
    updatedAt: number;
    ranks: RewardsCampaignLeaderboardRank[] | PointsCampaignLeaderboardRank[];
}
