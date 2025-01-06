import { useTranslations } from "next-intl";
import { ToastNotification, Typography } from "@metrom-xyz/ui";
import { ClaimReward } from "@/src/assets/claim-reward";
import { RemoteLogo } from "@/src/components/remote-logo";
import type { Erc20Token } from "@metrom-xyz/sdk";
import { formatAmount } from "@/src/utils/format";
import type { SupportedChain } from "@metrom-xyz/contracts";

import styles from "./styles.module.css";

interface RecoverSuccessProps {
    toastId: string | number;
    chain?: SupportedChain;
    token?: Erc20Token;
    amount?: number;
}

export function RecoverSuccess({
    toastId,
    chain,
    token,
    amount,
}: RecoverSuccessProps) {
    const t = useTranslations("rewards.reimbursements.notification.success");

    return (
        <ToastNotification
            toastId={toastId}
            title={t("message")}
            // TODO: add different icon?
            icon={ClaimReward}
        >
            {!!chain && !!token && !!amount && (
                <div className={styles.contentWrapper}>
                    <RemoteLogo
                        size="sm"
                        chain={chain}
                        address={token.address}
                        defaultText={token.symbol}
                    />
                    <Typography size="lg" weight="medium">
                        {token.symbol}
                    </Typography>
                    <Typography size="lg" weight="medium">
                        {formatAmount({ amount })}
                    </Typography>
                </div>
            )}
        </ToastNotification>
    );
}
