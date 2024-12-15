import Layout from "../../components/Layout/Layout"
import styles from "./blog.module.css"
import { getAllPosts } from "@/lib/posts"
import BlogCardList from "@/components/BlogCardList/BlogCardList";

export default async function Blog() {
    const posts = await getAllPosts();
    return (
        <Layout>
            <h1>BLOG</h1>
            <h2>記事一覧</h2>
            <div className={styles.listConteiner}>
                <BlogCardList posts={posts}/>
            </div>
        </Layout>
    );
}