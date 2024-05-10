import type { TokenInfo } from "@uniswap/token-lists";
import type { TokenSelectSearchProps } from "./search/types";
import type { TokenInfoWithBalance } from "@/components/campaign-creation-form/rewards/types";

export interface TokenSelectProps {
    tokens: TokenInfoWithBalance[];
    loading?: boolean;
    open?: boolean;
    error?: boolean;
    optionDisabled?: (token: TokenInfo) => boolean;
    messages: {
        inputPlaceholder: string;
        search: TokenSelectSearchProps["messages"];
    };
}
