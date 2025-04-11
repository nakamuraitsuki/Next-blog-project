import styles from "./blog.module.css"
import Link from "next/link";
import { getAllPosts } from "@/lib"
import { Layout, BlogCardList } from "@/components";
import { BreadcrumbsItem } from "@/lib";
import { MdLibraryBooks } from "react-icons/md";

const BREAD_CLUMBS: BreadcrumbsItem[] = [
    { name: "Home", path: "/" },
    { name: "記事一覧", path: "/blog" },
]

const ITEMS_PER_PAGE = 4;

export default async function Blog() {
    const posts = await getAllPosts();
    return (
        <Layout breadcrumbs={BREAD_CLUMBS}>
            <h1 className={styles.title}>記事一覧</h1>
            <div className={styles.icon_wrap}>
                <Link href="/series" className={styles.icon} passHref>
                    <MdLibraryBooks size={32} title="シリーズ一覧へ"/>
                </Link>
            </div>
            <div className={styles.List}>
                <BlogCardList posts={posts} itemsPerPage={ITEMS_PER_PAGE} isPagination={true} />
            </div>
        </Layout>
    );
}