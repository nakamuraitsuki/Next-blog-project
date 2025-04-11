import { Series } from "@/lib";
import styles from "./SeriesCard.module.css"
import Link from "next/link";

type SeriesCardProps = {
    series: Series;
};

export const SeriesCard = ({ series } :SeriesCardProps) => {
    return (
        <Link href={`/series/${series.name}`} passHref>
            <div className={styles.card}>
                <h1 className={styles.title}>{series.name}</h1> 
                <p>記事数：{series.size}</p>
            </div>
        </Link>
    );
}