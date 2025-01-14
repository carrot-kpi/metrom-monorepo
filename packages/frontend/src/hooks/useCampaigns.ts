import { metromApiClient } from "../commons";
import { type Campaign } from "@metrom-xyz/sdk";
import { getCampaignName } from "../utils/campaign";
import { useQuery } from "@tanstack/react-query";

export type NamedCampaign = Campaign & {
    name: string;
};

export function useCampaigns(): {
    loading: boolean;
    campaigns?: NamedCampaign[];
} {
    const { data: campaigns, isPending: loading } = useQuery({
        queryKey: ["campaigns"],
        queryFn: async () => {
            try {
                const fetchedCampaigns = await metromApiClient.fetchCampaigns();
                const namedCampaigns: NamedCampaign[] = [];
                for (const campaign of fetchedCampaigns) {
                    namedCampaigns.push({
                        ...campaign,
                        name: getCampaignName(campaign),
                    });
                }
                return namedCampaigns;
            } catch (error) {
                throw new Error(`Could not fetch campaigns: ${error}`);
            }
        },
    });

    return {
        loading,
        campaigns,
    };
}
