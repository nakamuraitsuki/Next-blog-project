import styles from "./blog.module.css"
import { getAllPosts } from "@/lib"
import { Layout, BlogCardList } from "@/components";

export default async function Blog() {
    const posts = await getAllPosts();
    return (
        <Layout>
            <h1 className={styles.title}>記事一覧</h1>
            <div className={styles.List}>
                <BlogCardList posts={posts}/>
            </div>
        </Layout>
    );
}