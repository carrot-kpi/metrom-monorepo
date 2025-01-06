import type {
    KpiSpecification,
    PoolWithTvl,
    RangeSpecification,
    SupportedDex,
    WhitelistedErc20Token,
    WhitelistedErc20TokenAmount,
} from "@metrom-xyz/sdk";
import type { Dayjs } from "dayjs";
import type { SVGProps, FunctionComponent } from "react";
import type { Address } from "viem";

type PropertyUnion<T> = {
    [K in keyof T]: { [P in K]: T[K] };
}[keyof T];
export type SVGIcon = Omit<SVGProps<SVGSVGElement>, "dangerouslySetInnerHTML">;

export interface Dex {
    slug: SupportedDex;
    name: string;
    addLiquidityUrl: string;
    poolExplorerUrl?: string;
    logo: FunctionComponent<SVGIcon>;
}

export enum RestrictionType {
    Blacklist = "blacklist",
    Whitelist = "whitelist",
}

export enum RewardType {
    Points = "points",
    Tokens = "tokens",
}

export interface RangeBound {
    tick: number;
    price: number;
}

export interface EnrichedRangeSpecification {
    from: RangeBound;
    to: RangeBound;
}

export interface CampaignPayload {
    network?: number;
    rewardType?: RewardType;
    dex?: DexInfo;
    pool?: PoolWithTvl;
    startDate?: Dayjs;
    endDate?: Dayjs;
    points?: number;
    tokens?: WhitelistedErc20TokenAmount[];
    feeToken?: WhitelistedErc20TokenAmount;
    kpiSpecification?: KpiSpecification;
    rangeSpecification?: EnrichedRangeSpecification;
    restrictions?: {
        type: RestrictionType;
        list: Address[];
    };
}

export interface CampaignPayloadErrors {
    startDate?: boolean;
    endDate?: boolean;
    rewards?: boolean;
    kpiSpecification?: boolean;
    rangeSpecification?: boolean;
    restrictions?: boolean;
}

export type DexInfo = Pick<Dex, "slug" | "name" | "logo">;

export type CampaignPayloadPart = PropertyUnion<CampaignPayload>;
