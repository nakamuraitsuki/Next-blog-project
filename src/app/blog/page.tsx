import styles from "./blog.module.css"
import { getAllPosts } from "@/lib"
import { Layout, BlogCardList } from "@/components";
import { BreadcrumbsItem } from "@/lib";

const BREAD_CLUMBS: BreadcrumbsItem[] = [
    { name: "Home", path: "/" },
    { name: "記事一覧", path: "/blog" },
]

export default async function Blog() {
    const posts = await getAllPosts();
    return (
        <Layout breadcrumbs={BREAD_CLUMBS}>
            <h1 className={styles.title}>記事一覧</h1>
            <div className={styles.List}>
                <BlogCardList posts={posts}/>
            </div>
        </Layout>
    );
}