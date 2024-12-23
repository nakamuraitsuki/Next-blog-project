import { notFound } from "next/navigation";
import styles from "./slug.module.css"
import Layout from "../../../components/Layout/Layout"
import { getPostBySlug } from "@/lib/posts"
import { markdownToHTML } from "@/lib/markdown";
import 'highlight.js/styles/atom-one-dark.css';

interface PostProps {
    params: Promise<{ slug: string }>
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