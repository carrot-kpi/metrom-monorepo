import type {
    CampaignType,
    Erc20Token,
    Pool,
    PoolWithTvl,
    Specification,
    UsdPricedErc20Token,
} from "../types";
import type { Address, Hash, Hex } from "viem";

export interface BackendReward extends UsdPricedErc20Token {
    amount: string;
    remaining: string;
}

export type BackendPool = Omit<Pool, "chainId">;

export type BackendPoolWithTvl = Omit<PoolWithTvl, "chainId">;

// TODO: complete the type definition
export interface BackendLiquidityDebt {
    brand: string;
    usdDebt: number;
}

export interface BackendCampaignBase {
    chainId: number;
    id: Hex;
    from: number;
    to: number;
    createdAt: number;
    snapshottedAt: number | null;
    specification: Specification | null;
    rewards?: BackendReward[];
    points: string | null;
    apr: number | null;
}

export type BackendCampaign =
    | (BackendCampaignBase & {
          type: CampaignType.AmmPoolLiquidity;
          target: BackendPoolWithTvl;
      })
    | (BackendCampaignBase & {
          type: CampaignType.LiquidityDebt;
          target: BackendLiquidityDebt;
      });

export interface BackendClaim {
    chainId: number;
    campaignId: Hex;
    token: UsdPricedErc20Token;
    amount: string;
    proof: Hex[];
}

export interface BackendWhitelistedErc20Token extends UsdPricedErc20Token {
    minimumRate: string;
}

export type BackendReimbursement = BackendClaim;

export interface BackendActivity {
    transaction: {
        hash: Hash;
        timestamp: number;
    };
    payload:
        | {
              type: "claim-reward";
              token: Erc20Token;
              amount: string;
              receiver: Address;
          }
        | {
              type: "create-campaign";
              id: Hash;
          };
}

export interface BackendKpiMeasurement {
    from: number;
    to: number;
    percentage: number;
}

export interface BackendRewardsCampaignLeaderboardRank {
    account: Address;
    weight: number;
    position: number;
    distributed: {
        address: Address;
        decimals: number;
        symbol: string;
        name: string;
        amount: string;
        usdPrice: number;
    }[];
}

export interface BackendPointsCampaignLeaderboardRank {
    account: Address;
    weight: number;
    position: number;
    distributed: string;
}

export interface BackendLeaderboard {
    updatedAt?: number;
    ranks?:
        | BackendRewardsCampaignLeaderboardRank[]
        | BackendPointsCampaignLeaderboardRank[];
}
