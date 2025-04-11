import styles from "./series.module.css"
import { getAllSeries } from "@/lib"
import { Layout, SeriesList } from "@/components";
import { BreadcrumbsItem } from "@/lib";

const BREAD_CLUMBS: BreadcrumbsItem[] = [
    { name: "Home", path: "/" },
    { name: "シリーズ一覧", path: "/series" },
]

const ITEMS_PER_PAGE = 4;

export default async function Blog() {
    const series = await getAllSeries();
    return (
        <Layout breadcrumbs={BREAD_CLUMBS}>
            <h1 className={styles.title}>シリーズ一覧</h1>
            <div className={styles.List}>
                <SeriesList series={series} itemsPerPage={ITEMS_PER_PAGE} isPagination={true} />
            </div>
        </Layout>
    );
}
