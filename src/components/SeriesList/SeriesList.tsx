"use client"

import styles from "./SeriesList.module.css"
import { SeriesCard } from "./SeriesCard/SeriesCard"
import { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { Pagination } from "./Pagination/Pagination";
import { Series } from "@/lib";

type BlogCardListProps = {
    series: Series[];
    itemsPerPage: number;
    isPagination: boolean;
};

export const SeriesList = ({ series, itemsPerPage, isPagination } :BlogCardListProps) => {
    const [page, setPage] = useState(1);
    const [filteredSeries, setFilteredSeries] = useState(series.slice(0, itemsPerPage))

    const handlePageChange = (_e: ChangeEvent<unknown>,newPage: number) => {
        setPage(newPage);
    }

    useEffect(() =>{
        setFilteredSeries(series.slice((page-1)*itemsPerPage, page*itemsPerPage));
    },[page]);

    return (
        <div className={isPagination ? styles.wrapPagination : styles.wrap}>
            <div className={styles.cardList}>
                {filteredSeries.map((seriesItem) => (
                    <div key={seriesItem.name}>
                        <SeriesCard series={seriesItem}/>
                    </div>
                ))}
            </div>
            <div className={styles.pagination}>
                {isPagination ?
                    <Pagination
                        series={series}
                        itemsPerPage={itemsPerPage}
                        page={page}
                        handlePageChange={handlePageChange}
                    />
                    :
                    <div/>
                }
            </div>
        </div>
    );
}