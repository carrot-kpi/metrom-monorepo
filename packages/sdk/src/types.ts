import { type Address, type Hash } from "viem";
import type { SupportedAmm } from "./commons";

export interface OnChainAmount {
    raw: bigint;
    formatted: number;
}

export interface UsdPricedOnChainAmount extends OnChainAmount {
    usdValue: number | null;
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
    amm: SupportedAmm;
    token0: Erc20Token;
    token1: Erc20Token;
    fee: number | null;
}

export interface PoolWithTvl extends Pool {
    usdTvl: number;
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

export interface Campaign {
    chainId: number;
    id: Address;
    from: number;
    to: number;
    status: Status;
    createdAt: number;
    snapshottedAt: number | null;
    pool: PoolWithTvl;
    rewards: Rewards;
    apr: number | null;
    specification: Specification | null;
}

export interface Claim extends Erc20TokenAmount {
    chainId: number;
    campaignId: Address;
    token: Erc20Token;
    amount: OnChainAmount;
    proof: Address[];
}

export interface WhitelistedErc20Token extends Erc20Token {
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

export interface Leaf {
    account: Address;
    tokenAddress: Address;
    amount: bigint;
}

export interface Snapshot {
    timestamp: number;
    leaves: Leaf[];
}
