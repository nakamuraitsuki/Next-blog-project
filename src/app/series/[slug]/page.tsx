import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./slug.module.css"
import { BreadcrumbsItem, getAllSeries, getPostsBySeries } from "@/lib"
import 'highlight.js/styles/atom-one-dark.css';
import { Layout, BlogCardList } from "@/components";

type PostProps = {
    params: Promise<{ slug: string }>
};

export async function generateStaticParams() {
    const series = await getAllSeries();
    return series.map((seriesItem) => ({
        slug: seriesItem.name,
    }));
}

//動的メタデータ設定
export const generateMetadata = async (props: PostProps): Promise<Metadata> => {
    const params = await props.params;
    const { slug } = params;
  
    return {
      title: `${slug}【しゃべる葦原】`,
      openGraph: {
        title: `${slug}【しゃべる葦原】`,
        url: `https://your-site.com/post/${slug}`, // 共有されるURLを設定
      }
    };
}

const ITEMS_PER_PAGE = 4;

export default async function Slug(props: PostProps) {
    const params = await props.params;
    const { slug } = params;
    const series = await getPostsBySeries(slug)

    if(!series) {
        notFound();
    }

    const breadcrumbs: BreadcrumbsItem[] = [
        { name: "Home", path: "/" },
        { name: "シリーズ", path: "/series" },
        { name: series.name, path: `/blog/${series.name}` },
    ]

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <h1 className={styles.hero}>{series.name}</h1>
            <div className={styles.List}>
                <BlogCardList posts={series.posts} itemsPerPage={ITEMS_PER_PAGE} isPagination={true} />
            </div>
        </Layout>
    )
}