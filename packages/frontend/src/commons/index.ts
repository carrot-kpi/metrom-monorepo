import {
    type Erc20Token,
    MetromApiClient,
    SERVICE_URLS,
    Environment,
} from "@metrom-xyz/sdk";
import { type ChainContract, type Chain } from "viem";
import { type Dex, type SVGIcon } from "../types";
import type { FunctionComponent } from "react";
import { SupportedChain } from "@metrom-xyz/contracts";
import { ENVIRONMENT } from "./env";
import {
    celoAlfajores,
    holesky,
    mantleSepoliaTestnet,
    mode,
    mantle,
    base,
    baseSepolia,
    taiko,
    scroll,
    sonic,
    gnosis,
    sepolia,
} from "viem/chains";

import {
    celoAlfajoresData,
    holeskyData,
    mantleSepoliaData,
    modeData,
    mantleData,
    sonicData,
    baseData,
    baseSepoliaData,
    taikoData,
    scrollData,
    formTestnet,
    formTestnetData,
    arthera,
    artheraData,
    form,
    formData,
    gnosisData,
    sepoliaData,
} from "./chains";

export interface ChainData {
    name: string;
    metromContract: ChainContract;
    blockExplorers: Chain["blockExplorers"];
    icon: FunctionComponent<SVGIcon>;
    dexes: Dex[];
    baseTokens: Erc20Token[];
}

export const FEE_UNIT = 1_000_000;

export const MAX_U256 =
    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

export const METROM_DATA_MANAGER_JWT_ISSUER = "metrom-data-manager";

export const MAXIMUM_REWARDS_RESTRICTIONS = 20;

export const SUPPORTED_CHAINS: [Chain, ...Chain[]] =
    ENVIRONMENT === Environment.Production
        ? [mode, mantle, base, taiko, scroll, sonic, arthera, form, gnosis]
        : [
              celoAlfajores,
              holesky,
              mantleSepoliaTestnet,
              baseSepolia,
              formTestnet,
              sepolia,
          ];

export const TOKEN_ICONS_URL = `https://raw.githubusercontent.com/metrom-xyz/token-icons/refs/heads/main/${ENVIRONMENT === Environment.Production ? "mainnet" : "testnet"}-icons.json`;

// TODO: when upgrading the contracts library change this to be Record<SupportedChain, ChainData>
export const CHAIN_DATA: Record<number, ChainData> = {
    [SupportedChain.Holesky]: holeskyData,
    [SupportedChain.CeloAlfajores]: celoAlfajoresData,
    [SupportedChain.MantleSepolia]: mantleSepoliaData,
    [SupportedChain.BaseSepolia]: baseSepoliaData,
    [SupportedChain.FormTestnet]: formTestnetData,
    [SupportedChain.Sepolia]: sepoliaData,

    [SupportedChain.Base]: baseData,
    [SupportedChain.Mode]: modeData,
    [SupportedChain.Mantle]: mantleData,
    [SupportedChain.Taiko]: taikoData,
    [SupportedChain.Scroll]: scrollData,
    [SupportedChain.Sonic]: sonicData,
    [SupportedChain.Arthera]: artheraData,
    [SupportedChain.Form]: formData,
    100: gnosisData,
};

export const metromApiClient = new MetromApiClient(
    SERVICE_URLS[ENVIRONMENT].metrom,
);

// taken from https://github.com/wevm/wagmi/blob/80326815bea2f175623157f57465f9dfae1f4c5c/packages/connectors/src/safe.ts#L45
export const SAFE_CONNECTOR_ID = "safe";
