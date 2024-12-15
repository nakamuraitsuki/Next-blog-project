import Layout from "../../components/Layout/Layout"
import { getAllPosts } from "@/lib/posts"

export default async function Blog() {
    const posts = await getAllPosts();
    return (
        <Layout>
            <h1>BLOG</h1>
            <h2>記事一覧</h2>
            {posts.map((post) => (
                <div key={post.slug}>
                    <p>{post.frontMatter.title}</p>
                    <p>{post.frontMatter.description}</p>
                    <p>{post.frontMatter.date}</p>
                </div>
            ))}
        </Layout>
    );
}