import styles from "./page.module.css"
import Layout from "@/components/Layout/Layout"
import { getAllPosts } from "@/lib/posts"

export default async function Home() {
  const posts = await getAllPosts();
  return (
    <Layout>
      <h1>HOME</h1>
    </Layout>
  );
}
