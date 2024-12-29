import styles from "./page.module.css"
import Link from "next/link";
import Layout from "@/components/Layout/Layout"
import { getAllPosts } from "@/lib"
import BlogCardList from "@/components/BlogCardList/BlogCardList";
import LinkButton from "@/components/LinkButton/LinkButton";

//最新記事の取得個数
const RECCENT_ARTICLE = 2;

export default async function Home() {
  const posts = await getAllPosts();
  const reccentPosts = posts.slice(0,RECCENT_ARTICLE);
  return (
    <Layout>
      <h1 className={styles.hero}>しゃべる葦原</h1>
      <div className={styles.descriptions}>
        <p>しがない大学生nakamuraitsukiの個人ブログです</p>
        <p>趣味のプログラミングで学んだことや感情の動いた出来事を備忘録的に記事にします</p>
        <div className={styles.right}>
          <Link href="/about" className={styles.aboutLink}>自己紹介はこちら</Link>
        </div>
      </div>
      <h2 className={styles.title}>最近の記事</h2>
      <BlogCardList posts={reccentPosts}/>
      <div className={styles.buttonWrap}>
        <LinkButton href="/blog" text="もっとみる"/>
      </div>
    </Layout>
  );
}
