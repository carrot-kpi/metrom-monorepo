import type { CampaignStepProps } from "@/views/create-campaign-view/types";
import type { TokenInfo } from "@uniswap/token-lists";

export type TokenInfoWithBalance = TokenInfo & {
    balance?: bigint | null;
    minimumRate?: bigint;
};

export interface RewardsPickerTypes extends CampaignStepProps {}
