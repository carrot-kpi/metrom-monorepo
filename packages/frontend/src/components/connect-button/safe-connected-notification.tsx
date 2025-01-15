import { useTranslations } from "next-intl";
import { ToastNotification, Typography } from "@metrom-xyz/ui";
import { SafeLogo } from "@/src/assets/logos/safe";

interface SafeConnectedNotificationProps {
    toastId: string | number;
}

export function SafeConnectedNotification({
    toastId,
}: SafeConnectedNotificationProps) {
    const t = useTranslations("notifications.safe");

    return (
        <ToastNotification toastId={toastId} title={t("title")} icon={SafeLogo}>
            <Typography weight="medium">{t("content")}</Typography>
        </ToastNotification>
    );
}
