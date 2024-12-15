import styles from "./page.module.css"
import Layout from "@/components/Layout/Layout"
import { getAllPosts } from "@/lib/posts"

export default async function Home() {
  const posts = await getAllPosts();
  return (
    <Layout>
      <div className={styles.content}>
        <h1>HOME</h1>
        <h2>Blog Posts</h2>
        {posts.map((post) => (
          <div key={post.slug}>
            <p>{post.frontMatter.title}</p>
            <p>{post.frontMatter.description}</p>
            <p>{post.slug}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
