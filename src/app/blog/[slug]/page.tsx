import { notFound } from "next/navigation";
import Head from 'next/head';
import styles from "./slug.module.css"
import Layout from "../../../components/Layout/Layout"
import { getAllPosts, getPostBySlug } from "@/lib/posts"
import { markdownToHTML } from "@/lib/markdown";
import 'highlight.js/styles/atom-one-dark.css';

interface PostProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Slug(props: PostProps) {
    const params = await props.params;
    const { slug } = params;
    const post = await getPostBySlug(slug);

    if(!post) {
        notFound();
    }

    const html = await markdownToHTML(post.content);

    return (
        <Layout>
            <Head>
                <title>{post.frontMatter.title || 'しゃべる葦原'}</title>
                <meta name="description" content={post.frontMatter.description || ''} />
                <meta property="og:title" content={post.frontMatter.title || 'しゃべる葦原'} />
                <meta property="og:description" content={post.frontMatter.description || ''} />
            </Head>
            <h1 className={styles.hero}>{post.frontMatter.title}</h1>
            <div className={styles.contents}>
                <p className={styles.date}>{post.frontMatter.date}</p>
                <div
                    className={styles.markdown}
                    dangerouslySetInnerHTML={{ __html: html }}    
                />
            </div>
        </Layout>
    )
}