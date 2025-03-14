import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./slug.module.css"
import { BreadcrumbsItem, getAllPosts, getPostBySlug, markdownToJSX } from "@/lib"
import 'highlight.js/styles/atom-one-dark.css';
import { Layout, Toc } from "@/components";

type PostProps = {
    params: Promise<{ slug: string }>
};

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}
//動的メタデータ設定
export const generateMetadata = async (props: PostProps): Promise<Metadata> => {
    const params = await props.params;
    const { slug } = params;
    const post = await getPostBySlug(slug);
  
    return {
      title: `${post?.frontMatter.title}【しゃべる葦原】`,
      description: `${post?.frontMatter.description}`,
      openGraph: {
        title: `${post?.frontMatter.title}【しゃべる葦原】`,
        description: post?.frontMatter.description,
        url: `https://your-site.com/post/${slug}`, // 共有されるURLを設定
      }
    };
}

export default async function Slug(props: PostProps) {
    const params = await props.params;
    const { slug } = params;
    const post = await getPostBySlug(slug);

    if(!post) {
        notFound();
    }

    const markdownContents = await markdownToJSX(post.content);

    const breadcrumbs: BreadcrumbsItem[] = [
        { name: "Home", path: "/" },
        { name: "記事一覧", path: "/blog" },
        { name: post.frontMatter.title, path: `/blog/${post.slug}` },
    ]

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <h1 className={styles.hero}>{post.frontMatter.title}</h1>
            <div className={styles.mainContent}>
                <div className={styles.articleContent}>
                    <p className={styles.date}>{post.frontMatter.date}</p>
                    <div className={styles.markdown}>
                        {markdownContents.JSXElement}
                    </div>
                </div>
                <aside className={styles.sidebar}>
                    <div className={styles.stickyBlock}>
                        <Toc toc={markdownContents.toc}/>
                    </div>
                </aside>
            </div>
        </Layout>
    )
}