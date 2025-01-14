import { ClaimReward } from "@/src/assets/claim-reward";
import { NewCampaignIcon } from "@/src/assets/new-campaign-icon";
import { type Activity, CampaignType } from "@metrom-xyz/sdk";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { Typography, Skeleton } from "@metrom-xyz/ui";
import { Link } from "@/src/i18n/routing";
import { formatTokenAmount } from "@/src/utils/format";
import { trackFathomEvent } from "@/src/utils/fathom";
import { RemoteLogo } from "@/src/components/remote-logo";
import { ArrowRightIcon } from "@/src/assets/arrow-right-icon";
import { getTxExplorerLink } from "@/src/utils/dex";
import { useCampaign } from "@/src/hooks/useCampaign";
import { getCampaigPoolName } from "@/src/utils/campaign";
import { PoolRemoteLogo } from "@/src/components/pool-remote-logo";
import { useDexesInChain } from "@/src/hooks/useDexesInChain";

import styles from "./styles.module.css";

interface ActivityProps extends Activity {
    chainId: number;
}

export function Activity({ chainId, transaction, payload }: ActivityProps) {
    const t = useTranslations("accountMenu.activities");

    const dexes = useDexesInChain(chainId);
    const { campaign, loading } = useCampaign(
        chainId,
        payload.type === "create-campaign" ? payload.id : undefined,
    );

    const time = dayjs.unix(transaction.timestamp).to(dayjs(), true);
    const timeAgo = t("timeAgo", { time });
    const explorerLink = getTxExplorerLink(transaction.hash, chainId);

    const { Icon, title } =
        payload.type === "create-campaign"
            ? {
                  Icon: NewCampaignIcon,
                  title: t("createCampaign"),
              }
            : {
                  Icon: ClaimReward,
                  title: t("claimReward"),
              };

    const dex = dexes.find((dex) => {
        // FIXME: better way to handle this
        if (campaign?.type === CampaignType.AmmPoolLiquidity)
            return dex.slug === campaign?.target.dex;
    });
    const DexLogo = dex?.logo;

    function handleActivityOnClick() {
        trackFathomEvent("CLICK_ACTIVITY");
    }

    return (
        <div className={styles.root}>
            <div className={styles.leftWrapper}>
                <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                </div>
                <div className={styles.leftBodyWrapper}>
                    <div className={styles.titleWrapper}>
                        <Typography light weight="medium" uppercase size="sm">
                            {title}
                        </Typography>
                        {explorerLink && (
                            <a
                                href={explorerLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ArrowRightIcon
                                    className={styles.externalLinkIcon}
                                />
                            </a>
                        )}
                    </div>
                    {payload.type === "create-campaign" ? (
                        <>
                            {!loading && campaign ? (
                                <Link
                                    href={`/campaigns/${chainId}/${payload.id}`}
                                    onClick={handleActivityOnClick}
                                >
                                    <div className={styles.campaignNameWrapper}>
                                        {DexLogo && (
                                            <DexLogo
                                                className={styles.dexIcon}
                                            />
                                        )}
                                        {campaign.type ===
                                            CampaignType.AmmPoolLiquidity && (
                                            <PoolRemoteLogo
                                                size="sm"
                                                chain={campaign.chainId}
                                                tokens={campaign.target.tokens.map(
                                                    (token) => ({
                                                        address: token.address,
                                                        defaultText:
                                                            token.symbol,
                                                    }),
                                                )}
                                            />
                                        )}
                                        <Typography
                                            className={styles.seeCampaignLink}
                                            weight="medium"
                                        >
                                            {getCampaigPoolName(campaign)}
                                        </Typography>
                                    </div>
                                </Link>
                            ) : (
                                <div className={styles.campaignNameWrapper}>
                                    <Skeleton
                                        width={16}
                                        circular
                                        className={styles.skeleton}
                                    />
                                    <PoolRemoteLogo
                                        size="sm"
                                        tokens={[
                                            { address: "0x1" },
                                            { address: "0x2" },
                                        ]}
                                        loading
                                        className={{ root: styles.skeleton }}
                                    />
                                    <Skeleton
                                        width={90}
                                        className={styles.skeleton}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.claimRewardWrapper}>
                            <RemoteLogo
                                size="sm"
                                chain={chainId}
                                address={payload.token.address}
                                defaultText={payload.token.symbol}
                            />
                            <Typography noWrap>
                                {payload.token.symbol}
                            </Typography>
                            <Typography>
                                {formatTokenAmount({
                                    amount: payload.amount.formatted,
                                })}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
            <Typography light truncate>
                {timeAgo}
            </Typography>
        </div>
    );
}

export function SkeletonActivity() {
    return (
        <div className={styles.root}>
            <div className={styles.leftWrapper}>
                <div className={styles.iconWrapper}>
                    <Skeleton className={styles.skeleton} />
                </div>
                <div className={styles.leftBodyWrapper}>
                    <Skeleton
                        width={60}
                        size="sm"
                        className={styles.skeleton}
                    />
                    <Skeleton width={140} className={styles.skeleton} />
                </div>
            </div>
            <Skeleton width={50} className={styles.skeleton} />
        </div>
    );
}
