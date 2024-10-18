export interface ChainConfig {
    Factory: {
        address: string;
        startBlock: number;
    };
    NonFungiblePositionManager: {
        address: string;
        startBlock: number;
    };
}

export const DEPLOYMENTS: {
    [network: string]: { [amm: string]: ChainConfig };
} = {
    taiko: {
        panko: {
            Factory: {
                address: "0x99960D7076297a1E0C86f3cc60FfA5d6f2B507B5",
                startBlock: 433329,
            },
            NonFungiblePositionManager: {
                address: "0xbbD6db7cDb3C3a0Ce26c89918D7ce99FB2d403aF",
                startBlock: 433334,
            },
        },
    },
};