import styles from "./page.module.css"
import Link from "next/link";
import { Layout, BlogCardList, LinkButton } from "@/components"
import { BreadcrumbsItem, getAllPosts } from "@/lib"

//最新記事の取得個数
const RECCENT_ARTICLE = 2;
const BREAD_CRUMBS: BreadcrumbsItem[] = [
  { name:"Home", path:"/" }
]

export default async function Home() {
  const posts = await getAllPosts();
  const reccentPosts = posts.slice(0,RECCENT_ARTICLE);
  return (
    <Layout breadcrumbs={BREAD_CRUMBS}>
      <h1 className={styles.hero}>しゃべる葦原</h1>
      <div className={styles.descriptions}>
        <p>しがない大学生nakamuraitsukiの個人ブログです</p>
        <p>趣味のプログラミングで学んだことや感情の動いた出来事を備忘録的に記事にします</p>
        <div className={styles.right}>
          <Link href="/about" className={styles.aboutLink}>自己紹介はこちら</Link>
        </div>
      </div>
      <h2 className={styles.title}>最近の記事</h2>
      <BlogCardList posts={reccentPosts} itemsPerPage={2} isPagination={false}/>
      <div className={styles.buttonWrap}>
        <LinkButton href="/blog" text="もっとみる"/>
      </div>
    </Layout>
  );
}
