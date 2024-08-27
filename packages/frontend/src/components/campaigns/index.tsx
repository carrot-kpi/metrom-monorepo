"use client";

import { Typography } from "@/src/ui/typography";
import { useCampaigns } from "@/src/hooks/useCampaigns";
import { Campaign, SkeletonCampaign } from "./campaign";

import { useTranslations } from "next-intl";
import { usePagination } from "@/src/hooks/usePagination";
import { useMemo, useState, type ChangeEvent } from "react";
import { TextInput } from "@/src/ui/text-input";
import { SearchIcon } from "@/src/assets/search-icon";
import { useDebounce } from "react-use";
import { filterCampaigns, sortCampaigns } from "@/src/utils/filtering";
import { Pagination } from "@/src/ui/pagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import styles from "./styles.module.css";

const PAGE_SIZE = 10;
const QUERY_PARAM_SEARCH = "search";

export function Campaigns() {
    const t = useTranslations("allCampaigns");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(
        searchParams.get(QUERY_PARAM_SEARCH) || "",
    );
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [pageNumber, setPageNumber] = useState(1);

    const { loading, campaigns } = useCampaigns();

    useDebounce(
        () => {
            setDebouncedSearch(search);
            const params = new URLSearchParams(searchParams.toString());
            if (search)
                if (params.has(QUERY_PARAM_SEARCH))
                    params.set(QUERY_PARAM_SEARCH, search);
                else params.append(QUERY_PARAM_SEARCH, search);
            else params.delete(QUERY_PARAM_SEARCH);
            router.push(`${pathname}?${params.toString()}`);
        },
        300,
        [search],
    );

    const filteredCampaigns = useMemo(
        () => filterCampaigns(sortCampaigns(campaigns), debouncedSearch),
        [debouncedSearch, campaigns],
    );

    const { data: pagedCampaigns, totalPages } = usePagination({
        data: filteredCampaigns,
        page: pageNumber,
        size: PAGE_SIZE,
    });

    function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    function handlePreviousPage() {
        setPageNumber((page) => page - 1);
    }

    function handleNextPage() {
        setPageNumber((page) => page + 1);
    }

    function handlePage(page: number) {
        setPageNumber(page);
    }

    return (
        <div className={styles.root}>
            <div className={styles.filters}>
                <TextInput
                    className={styles.searchInput}
                    icon={SearchIcon}
                    iconPlacement="right"
                    placeholder={t("filters.search.placeholder")}
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <div className={styles.row}>
                <Typography variant="sm" light weight="medium">
                    {t("header.chain")}
                </Typography>
                <Typography variant="sm" light weight="medium">
                    {t("header.pool")}
                </Typography>
                <Typography variant="sm" light weight="medium">
                    {t("header.status")}
                </Typography>
                <Typography variant="sm" light weight="medium">
                    {t("header.apr")}
                </Typography>
                <Typography variant="sm" light weight="medium">
                    {t("header.rewards")}
                </Typography>
            </div>
            <div className={styles.body}>
                {loading ? (
                    <>
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                        <SkeletonCampaign
                            className={`${styles.row} ${styles.bodyRow}`}
                        />
                    </>
                ) : (
                    pagedCampaigns.map((campaign) => {
                        return (
                            <Campaign
                                key={campaign.id}
                                campaign={campaign}
                                className={`${styles.row} ${styles.bodyRow}`}
                            />
                        );
                    })
                )}
            </div>
            <div className={styles.paginationWrapper}>
                <Pagination
                    page={pageNumber}
                    totalPages={totalPages}
                    onNext={handleNextPage}
                    onPrevious={handlePreviousPage}
                    onPage={handlePage}
                />
            </div>
        </div>
    );
}
